// src/seed-payroll.ts
import prisma from '@/lib/prisma';

async function main() {
  const components = [
    // Earning
    { name: 'Gaji Pokok', type: 'EARNING' },
    { name: 'Tunjangan Jabatan', type: 'EARNING' },
    { name: 'Tunjangan Makan', type: 'EARNING' },
    { name: 'Lembur', type: 'EARNING' },
    { name: 'SPD', type: 'EARNING' },
    { name: 'OPD', type: 'EARNING' },
    { name: 'PPh 21 Kantor', type: 'EARNING' },
    
    // Deduction
    { name: 'BPJS Kesehatan', type: 'DEDUCTION' },
    { name: 'BPJS Ketenagakerjaan', type: 'DEDUCTION' },
    { name: 'PPh 21', type: 'DEDUCTION' },
    { name: 'Potongan Absensi', type: 'DEDUCTION' },
    { name: 'Potongan Pinjaman', type: 'DEDUCTION' },
  ];

  for (const c of components) {
    await prisma.salaryComponent.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('✅ Master Komponen Gaji berhasil dibuat!');
}

main().catch(console.error).finally(() => prisma.$disconnect());