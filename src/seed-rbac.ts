// src/seed-rbac.ts
import prisma from '@/lib/prisma';

async function main() {
  // 1. Daftar Modul & Fitur
  const permissions = [
    // --- Modul Karyawan ---
    { name: 'employee:read', description: 'Melihat data karyawan' },
    { name: 'employee:write', description: 'Tambah/Edit/Hapus karyawan' },
    { name: 'employee:import', description: 'Import data Excel' },
    
    // --- Modul Absensi (Khusus TAD) ---
    { name: 'attendance:checkin', description: 'Melakukan absensi harian' },
    { name: 'attendance:manage', description: 'Mengelola data absensi TAD' },
    
    // --- Modul Cuti (HC) ---
    { name: 'leave:request', description: 'Mengajukan cuti' },
    { name: 'leave:approve', description: 'Menyetujui/menolak cuti' },

    // --- Modul Penggajian ---
    { name: 'payroll:view', description: 'Melihat slip gaji sendiri' },
    { name: 'payroll:manage', description: 'Mengelola gaji TAD' },

    // --- Modul Client / Eksternal ---
    { name: 'client:recruitment', description: 'Melihat status permintaan recruitment' },
    { name: 'client:billing', description: 'Melihat tagihan / invoice' },

    // --- Modul Sistem (Superadmin) ---
    { name: 'system:rbac', description: 'Mengatur hak akses sistem' },
  ]; // <-- Perhatikan penutup kurung siku di sini

  // Simpan Permissions ke Database
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  // 2. Daftar Role
  const roles = [
    { name: 'SUPERADMIN', description: 'Akses Penuh Sistem' },
    { name: 'TAD', description: 'Tenaga Ahli Daya' },
    { name: 'HC', description: 'Staff HC / HRD' },
    { name: 'LEGAL', description: 'Staff Legal' },
    { name: 'IT', description: 'Staff IT' },
    { name: 'CLIENT', description: 'User Eksternal / Client' },
  ];

  // Simpan Roles ke Database
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  // 3. Berikan SEMUA permission ke SUPERADMIN
  const superadmin = await prisma.role.findUnique({ where: { name: 'SUPERADMIN' } });
  const allPermissions = await prisma.permission.findMany();

  if (superadmin) {
    for (const p of allPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: superadmin.id, permissionId: p.id } },
        update: {},
        create: { roleId: superadmin.id, permissionId: p.id },
      });
    }
  }

  // 4. Atur Hak Akses Default untuk Role Lain
  const assignPermission = async (roleName: string, permissionNames: string[]) => {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;
    
    for (const pName of permissionNames) {
      const perm = await prisma.permission.findUnique({ where: { name: pName } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  };

  // TAD: Hanya bisa absen dan lihat gaji sendiri
  await assignPermission('TAD', ['attendance:checkin', 'payroll:view']);

  // HC (HRD): Kelola karyawan, setujui cuti, kelola absensi
  await assignPermission('HC', ['employee:read', 'employee:write', 'leave:approve', 'attendance:manage']);

  // LEGAL: Hanya lihat data karyawan (untuk kontrak)
  await assignPermission('LEGAL', ['employee:read']);

  // IT: Akses penuh ke sistem & karyawan
  await assignPermission('IT', ['employee:read', 'employee:write', 'system:rbac']);

  // CLIENT: Hanya lihat recruitment dan tagihan
  await assignPermission('CLIENT', ['client:recruitment', 'client:billing']);

  console.log('✅ Seed RBAC berhasil! Role & Permission awal sudah dibuat.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());