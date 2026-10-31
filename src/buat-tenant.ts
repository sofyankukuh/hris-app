import prisma from '@/lib/prisma';

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'PT BKP',
      employeePrefix: 'BKP-',
    },
  });
  console.log('✅ Tenant berhasil dibuat:', tenant.name);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());