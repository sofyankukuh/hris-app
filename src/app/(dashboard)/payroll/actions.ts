// src/app/(dashboard)/payroll/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- FUNGSI 1: PREVIEW DATA MENTAH (STEP 1) ---
export async function getPayrollPreview(startDate: Date, endDate: Date, filters: { customer?: string, branchCode?: string, position?: string }) {
  const employees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      customer: filters.customer || undefined,
      branchCode: filters.branchCode || undefined,
      position: filters.position || undefined,
      salaryTemplate: { isNot: null }
    },
    orderBy: { fullName: 'asc' }
  });

  const previewData = [];

  for (const emp of employees) {
    const hadir = await prisma.attendance.count({ where: { employeeId: emp.id, date: { gte: startDate, lte: endDate }, status: 'PRESENT' } });
    const alpa = await prisma.attendance.count({ where: { employeeId: emp.id, date: { gte: startDate, lte: endDate }, status: 'ABSENT' } });

    const incomes = await prisma.additionalIncome.groupBy({
      by: ['type'],
      where: { employeeId: emp.id, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true }
    });
    const lembur = incomes.find(i => i.type === 'LEMBUR')?._sum.amount || 0;
    const spd = incomes.find(i => i.type === 'SPD')?._sum.amount || 0;
    const opd = incomes.find(i => i.type === 'OPD')?._sum.amount || 0;

    const pendingResign = await prisma.resignation.count({ where: { employeeId: emp.id, status: 'PENDING' } });
    const pendingLeave = await prisma.leaveRequest.count({ where: { employeeId: emp.id, status: 'PENDING' } });

    previewData.push({
      id: emp.id, fullName: emp.fullName, employeeNumber: emp.employeeNumber,
      branchCode: emp.branchCode, hadir, alpa, lembur, spd, opd,
      pendingResign: pendingResign > 0, pendingLeave: pendingLeave > 0,
    });
  }
  return previewData;
}

// --- FUNGSI 2: HITUNG RINCIAN (STEP 2) ---
export async function calculatePayrollDetails(employeeIds: string[], startDate: Date, endDate: Date) {
  // KUNCI: Ambil bulan & tahun dari Tanggal Akhir Cut Off
  const month = endDate.getMonth() + 1;
  const year = endDate.getFullYear();
  const results = [];

  for (const empId of employeeIds) {
    const employee = await prisma.employee.findUnique({
      where: { id: empId },
      include: {
        salaryMasters: { include: { salaryComponent: true } },
        salaryTemplate: { include: { salaryTemplate: { include: { details: { include: { salaryComponent: true } } } } } },
      }
    });

    if (!employee || !employee.salaryTemplate) continue;

    const hadir = await prisma.attendance.count({ where: { employeeId: empId, date: { gte: startDate, lte: endDate }, status: 'PRESENT' } });
    const alpa = await prisma.attendance.count({ where: { employeeId: empId, date: { gte: startDate, lte: endDate }, status: 'ABSENT' } });

    let basicSalary = 0, totalEarnings = 0, totalDeductions = 0;
    const earningsMap: Record<string, number> = {};
    const deductionsMap: Record<string, number> = {};

    for (const detail of employee.salaryTemplate.salaryTemplate.details) {
      const comp = detail.salaryComponent;
      
      if (comp.type === 'EARNING') {
        let amount = 0;
        if (['Gaji Pokok', 'Tunjangan Jabatan', 'Tunjangan Makan'].includes(comp.name)) {
          amount = employee.salaryMasters.find(m => m.salaryComponentId === comp.id)?.amount || 0;
          if (comp.name === 'Gaji Pokok') basicSalary = amount;
        } else if (['Lembur', 'SPD', 'OPD'].includes(comp.name)) {
          const incomes = await prisma.additionalIncome.aggregate({
            where: { employeeId: empId, type: comp.name, date: { gte: startDate, lte: endDate } },
            _sum: { amount: true }
          });
          amount = incomes._sum.amount || 0;
        }
        earningsMap[comp.name] = amount;
        totalEarnings += amount;
      } 
      
      else if (comp.type === 'DEDUCTION') {
        let amount = 0;
        if (comp.name.includes('BPJS')) amount = (basicSalary * 2) / 100;
        else if (comp.name.includes('PPh 21')) amount = (basicSalary * 5) / 100;
        else if (comp.name === 'Potongan Absensi') amount = alpa * (basicSalary / 22);
        
        deductionsMap[comp.name] = amount;
        totalDeductions += amount;
      }
    }

    results.push({
      employeeId: empId, fullName: employee.fullName, employeeNumber: employee.employeeNumber, branchCode: employee.branchCode,
      hadir, alpa, earningsMap, deductionsMap, totalEarnings, totalDeductions, netSalary: totalEarnings - totalDeductions,
      month, year
    });
  }
  return results;
}

// --- FUNGSI 3: SIMPAN ---
export async function savePayroll(payrollData: any[], startDate: Date, endDate: Date, forceOverlap: boolean = false) {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("Tenant tidak ada");

  // 1. CEK TUMPANG TINDIH
  const overlappingBatch = await prisma.payrollBatch.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [
        { cutOffStart: { gte: startDate, lte: endDate } },
        { cutOffEnd: { gte: startDate, lte: endDate } },
        { cutOffStart: { lte: startDate }, cutOffEnd: { gte: endDate } }
      ]
    }
  });

  if (overlappingBatch && !forceOverlap) {
    return { 
      success: false, 
      warning: `Tanggal cut off tumpang tindih dengan batch sebelumnya (${overlappingBatch.cutOffStart.toLocaleDateString()} - ${overlappingBatch.cutOffEnd.toLocaleDateString()}). Lanjutkan proses?` 
    };
  }

  // 2. BUAT BATCH BARU
  const batch = await prisma.payrollBatch.create({
    data: {
      tenantId: tenant.id,
      periodMonth: endDate.getMonth() + 1,
      periodYear: endDate.getFullYear(),
      cutOffStart: startDate,
      cutOffEnd: endDate,
    }
  });

  let savedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const data of payrollData) {
    const existing = await prisma.payroll.findUnique({
      where: { employeeId_month_year: { employeeId: data.employeeId, month: data.month, year: data.year } }
    });

    if (existing) {
      // JIKA SUDAH PAID, LEWATI (Jangan timpa histori)
      if (existing.status === 'PAID') {
        skippedCount++;
        continue;
      }

      // JIKA DRAFT, TIMPA (Update)
      await prisma.payroll.update({
        where: { id: existing.id },
        data: { 
          basicSalary: data.basicSalary, 
          totalEarnings: data.totalEarnings, 
          totalDeductions: data.totalDeductions, 
          netSalary: data.netSalary,
          batchId: batch.id 
        }
      });
      updatedCount++;
    } else {
      // JIKA BELUM ADA, BUAT BARU
      await prisma.payroll.create({
        data: { 
          tenantId: tenant.id, 
          employeeId: data.employeeId, 
          month: data.month, 
          year: data.year, 
          basicSalary: data.basicSalary, 
          totalEarnings: data.totalEarnings, 
          totalDeductions: data.totalDeductions, 
          netSalary: data.netSalary, 
          status: 'DRAFT',
          batchId: batch.id 
        }
      });
      savedCount++;
    }
  }
  
  revalidatePath('/payroll');
  return { success: true, savedCount, updatedCount, skippedCount };
}

// --- FUNGSI 4: GET ALL COMPONENTS ---
export async function getAllComponents() {
  return await prisma.salaryComponent.findMany({ orderBy: { name: 'asc' } });
}