import prisma from './src/lib/prisma';

async function main() {
  const admin = await prisma.employee.findFirst({
    where: { email: 'superadmin@hris.com' },
    include: { role: true }
  });
  
  if (admin) {
    console.log('✅ Akun DITEMUKAN!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role?.name);
    console.log('Apakah punya password?', admin.password ? 'Ya' : 'TIDAK (KOSONG)');
  } else {
    console.log('❌ Akun TIDAK DITEMUKAN di database!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());