import prisma from '@/lib/prisma';

async function main() {
  await prisma.tenant.create({
    data: { name: 'PT BKP', employeePrefix: 'BKP-' }
  });
  console.log('Tenant berhasil dibuat!');
}
main();