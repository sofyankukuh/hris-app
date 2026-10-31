import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const roleAdmin = await prisma.role.findUnique({ where: { name: 'SUPERADMIN' } });
  const tenant = await prisma.tenant.findFirst();

  if (!tenant || !roleAdmin) return console.error('Tenant/Role tidak ada');

  // Hapus admin lama (jika ada) agar bersih
  await prisma.employee.deleteMany({ where: { email: 'superadmin@hris.com' } });

  await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      employeeNumber: 'ADM-001',
      fullName: 'Super Admin',
      email: 'superadmin@hris.com',
      password: hashedPassword,
      department: 'IT',
      position: 'System Administrator',
      joinDate: new Date(),
      status: 'ACTIVE',
      roleId: roleAdmin.id
    }
  });
  console.log('✅ Superadmin dibuat ulang dengan password bcrypt!');
}
main().catch(console.error).finally(() => prisma.$disconnect());