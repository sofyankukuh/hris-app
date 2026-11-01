// src/lib/payroll-calculator.ts
import prisma from '@/lib/prisma';

export async function calculateEmployeePayroll(employeeId: string, month: number, year: number) {
  // 1. Ambil data karyawan beserta Rumus (Template) dan Master Gajinya
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      salaryTemplate: {
        include: {
          salaryTemplate: {
            include: { details: { include: { salaryComponent: true } } }
          }
        }
      },
      salaryMasters: { include: { salaryComponent: true } },
    }
  });

  if (!employee) throw new Error("Karyawan tidak ditemukan");
  if (!employee.salaryTemplate) throw new Error(`Rumus gaji untuk ${employee.fullName} belum diset.`);

  const templateDetails = employee.salaryTemplate.salaryTemplate.details;
  
  let totalEarnings = 0;
  let totalDeductions = 0;
  let basicSalary = 0;

  // 2. Hitung Pendapatan (Earnings)
  for (const detail of templateDetails) {
    const comp = detail.salaryComponent;
    if (comp.type !== 'EARNING') continue;

    let amount = 0;

    // Jika komponen diambil dari Master (Gaji Pokok, Tunjangan)
    if (['Gaji Pokok', 'Tunjangan Jabatan', 'Tunjangan Makan'].includes(comp.name)) {
      const master = employee.salaryMasters.find(m => m.salaryComponentId === comp.id);
      amount = master?.amount || 0;
      if (comp.name === 'Gaji Pokok') basicSalary = amount;
    } 
    // Jika komponen diambil dari Pendapatan Tambahan (Lembur, SPD, OPD)
    else if (['Lembur', 'SPD', 'OPD'].includes(comp.name)) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const incomes = await prisma.additionalIncome.aggregate({
        where: {
          employeeId,
          type: comp.name,
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      });
      amount = incomes._sum.amount || 0;
    }

    totalEarnings += amount;
  }

  // 3. Hitung Potongan (Deductions)
  for (const detail of templateDetails) {
    const comp = detail.salaryComponent;
    if (comp.type !== 'DEDUCTION') continue;

    let amount = 0;

    // Jika Potongan BPJS (Persentase dari Gaji Pokok, misal 2%)
    if (comp.name.includes('BPJS')) {
      // Asumsi persentase disimpan di defaultValue (kita belum buat UI untuk isi persen, jadi hardcode 2% dulu)
      // Nanti kita buat UI untuk mengatur persentase di detail template
      const percentage = 2; // <-- Sementara hardcode 2%
      amount = (basicSalary * percentage) / 100;
    }
    // Jika PPh 21 (Persentase dari Gaji Pokok, misal 5%)
    else if (comp.name.includes('PPh 21')) {
      const percentage = 5; // <-- Sementara hardcode 5%
      amount = (basicSalary * percentage) / 100;
    }
    // Jika Potongan Absensi (Hitungan hari alpa)
    else if (comp.name === 'Potongan Absensi') {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const absences = await prisma.attendance.count({
        where: {
          employeeId,
          date: { gte: startDate, lte: endDate },
          status: 'ABSENT' // Asumsi ada status ABSENT untuk alpa
        }
      });

      // Potongan harian = Gaji Pokok / 22 hari kerja
      const dailyRate = basicSalary / 22;
      amount = absences * dailyRate;
    }
    // Jika Potongan Pinjaman (Nanti ambil dari Master Pinjaman)
    else if (comp.name === 'Potongan Pinjaman') {
      amount = 0; // Sementara 0
    }

    totalDeductions += amount;
  }

  const netSalary = totalEarnings - totalDeductions;

  // 4. Simpan ke Database
  await prisma.payroll.upsert({
    where: { employeeId_month_year: { employeeId, month, year } },
    update: { basicSalary, totalEarnings, totalDeductions, netSalary, status: 'DRAFT' },
    create: { 
      tenantId: employee.tenantId, 
      employeeId, 
      month, 
      year, 
      basicSalary, 
      totalEarnings, 
      totalDeductions, 
      netSalary, 
      status: 'DRAFT' 
    }
  });

  return { basicSalary, totalEarnings, totalDeductions, netSalary };
}