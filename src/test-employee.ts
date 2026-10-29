// src/test-employee.ts
import prisma from '@/lib/prisma';
import { employeeService } from '@/modules/employee/employee.service';

async function main() {
  console.log('⏳ Memulai uji coba...');

  // 1. Buat "Perusahaan" (Tenant) dummy
  const tenant = await prisma.tenant.create({
    data: {
      name: 'PT Maju Bersama',
    },
  });
  console.log('✅ Tenant berhasil dibuat:', tenant.name);

  // 2. Siapkan data karyawan
  const dataKaryawanBaru = {
    tenantId: tenant.id,
    employeeNumber: 'EMP-001',
    fullName: 'Budi Santoso',
    email: 'budi@majubersama.com',
    department: 'IT',
    position: 'Software Engineer',
    joinDate: new Date('2026-01-01'),
    status: 'ACTIVE' as const,
  };

  // 3. Simpan via service
  console.log('⏳ Menyimpan karyawan...');
  const karyawan = await employeeService.createEmployee(dataKaryawanBaru);
  
  console.log('✅ Karyawan berhasil disimpan!');
  console.log('ID Karyawan:', karyawan.id);
  console.log('Nama:', karyawan.fullName);

  // 4. Uji ambil data
  console.log('⏳ Mengambil daftar karyawan...');
  const daftarKaryawan = await employeeService.getEmployees(tenant.id);
  console.log(`✅ Berhasil mengambil ${daftarKaryawan.length} karyawan.`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });