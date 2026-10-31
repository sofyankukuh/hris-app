// src/app/employees/import/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function saveImportedData(data: any[], action: 'skip' | 'overwrite') {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error('Tenant tidak ditemukan');

    const prefix = tenant.employeePrefix;
    const existingEmployees = await prisma.employee.findMany({
      where: { tenantId: tenant.id, employeeNumber: { startsWith: prefix } },
      select: { employeeNumber: true }
    });
    let maxNumber = 0;
    existingEmployees.forEach((emp) => {
      const parsed = parseInt(emp.employeeNumber.replace(prefix, ""), 10);
      if (!isNaN(parsed) && parsed > maxNumber) maxNumber = parsed;
    });

    let successCount = 0;
    let skipCount = 0;
    let updateCount = 0;
    let invalidCount = 0;

    for (const row of data) {
      const safeOldNik = row.oldNik ? String(row.oldNik).trim() : null;
      const safeKtpNumber = row.ktpNumber ? String(row.ktpNumber).trim() : null;
      const safeEmail = row.email ? String(row.email).trim() : null;
      const safeCustomer = row.customer ? String(row.customer).trim() : null;
      const safeBranchCode = row.branchCode ? String(row.branchCode).trim() : null;
      const safeOutlet = row.outlet ? String(row.outlet).trim() : null;

      // Validasi dasar: Email wajib ada
      if (!safeEmail) {
        invalidCount++;
        continue;
      }

      // Cek Duplikat: HARUS KETIGANYA SAMA (AND)
      // Jika NIK beda, atau Email beda, atau KTP beda, maka dianggap karyawan baru.
      const existing = await prisma.employee.findFirst({
        where: {
          tenantId: tenant.id,
          AND: [
            { oldEmployeeNumber: safeOldNik },
            { ktpNumber: safeKtpNumber },
            { email: safeEmail },
          ]
        }
      });

      if (existing) {
        if (action === 'skip') {
          skipCount++;
          continue;
        } else if (action === 'overwrite') {
          await prisma.employee.update({
            where: { id: existing.id },
            data: {
              fullName: row.fullName, 
              department: row.department, 
              position: row.position,
              customer: safeCustomer,
              branchCode: safeBranchCode,
              outlet: safeOutlet,
              phoneNumber: row.phoneNumber ? String(row.phoneNumber) : null, 
              education: row.education, 
              birthPlace: row.birthPlace,
              birthDate: row.birthDate, 
              religion: row.religion, 
              maritalStatus: row.maritalStatus,
              address: row.address, 
              motherName: row.motherName, 
              spouseName: row.spouseName,
              childrenCount: row.childrenCount ? parseInt(String(row.childrenCount), 10) : 0, 
              jamsostekNumber: row.jamsostekNumber ? String(row.jamsostekNumber) : null,
              npwpNumber: row.npwpNumber ? String(row.npwpNumber) : null, 
              bankName: row.bankName, 
              bankAccount: row.bankAccount ? String(row.bankAccount) : null,
              joinDate: row.joinDate || new Date(), 
              contractStart: row.contractStart,
              contractEnd: row.contractEnd, 
              contractNumber: row.contractNumber,
            }
          });
          updateCount++;
          continue;
        }
      }

            // --- LOGIKA PENENTUAN NIK (LOMPAT & HORMATI NIK EXCEL) ---
      let newEmployeeNumber = safeOldNik; // 1. Prioritaskan NIK dari Excel

      if (!newEmployeeNumber) {
        // 2. Jika di Excel NIK kosong, buat NIK otomatis (Lompat +1)
        maxNumber += 1;
        newEmployeeNumber = `${prefix}${maxNumber.toString().padStart(3, '0')}`;
      } else {
        // 3. Jika di Excel ADA NIK, pastikan NIK itu belum dipakai di database
        const isNikExist = await prisma.employee.findFirst({
          where: { tenantId: tenant.id, employeeNumber: newEmployeeNumber }
        });
        
        if (isNikExist) {
           // Jika NIK sudah ada, lewati baris ini (jangan ditimpa)
           skipCount++;
           continue;
        }
        
        // 4. Update maxNumber agar baris berikutnya (jika ada yang kosong) tidak bentrok
        const parsedNik = parseInt(newEmployeeNumber.replace(prefix, ""), 10);
        if (!isNaN(parsedNik) && parsedNik > maxNumber) {
          maxNumber = parsedNik;
        }
      }
      
      await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          employeeNumber: newEmployeeNumber,
          oldEmployeeNumber: safeOldNik,
          ktpNumber: safeKtpNumber, 
          fullName: row.fullName, 
          email: safeEmail, 
          department: row.department, 
          position: row.position,
          customer: safeCustomer,
          branchCode: safeBranchCode,
          outlet: safeOutlet, 
          phoneNumber: row.phoneNumber ? String(row.phoneNumber) : null, 
          education: row.education, 
          birthPlace: row.birthPlace, 
          birthDate: row.birthDate,
          religion: row.religion, 
          maritalStatus: row.maritalStatus, 
          address: row.address, 
          motherName: row.motherName, 
          spouseName: row.spouseName, 
          childrenCount: row.childrenCount ? parseInt(String(row.childrenCount), 10) : 0,
          jamsostekNumber: row.jamsostekNumber ? String(row.jamsostekNumber) : null, 
          npwpNumber: row.npwpNumber ? String(row.npwpNumber) : null, 
          bankName: row.bankName, 
          bankAccount: row.bankAccount ? String(row.bankAccount) : null, 
          joinDate: row.joinDate || new Date(),
          contractStart: row.contractStart, 
          contractEnd: row.contractEnd, 
          contractNumber: row.contractNumber,
          status: 'ACTIVE',
        }
      });
      successCount++;
    }

    revalidatePath('/employees');
    return { success: true, successCount, skipCount, updateCount, invalidCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}