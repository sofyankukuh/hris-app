// src/app/(dashboard)/payroll/report/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBatchDetails(batchId: string) {
  return await prisma.payroll.findMany({
    where: { batchId },
    include: { employee: true },
    orderBy: { employee: { fullName: 'asc' } }
  });
}

export async function markBatchAsPaid(payrollIds: string[]) {
  await prisma.payroll.updateMany({
    where: { id: { in: payrollIds } },
    data: { status: 'PAID' }
  });
  revalidatePath('/payroll/report');
  return true;
}

export async function deleteBatch(batchId: string) {
  const paidCount = await prisma.payroll.count({
    where: { batchId, status: 'PAID' }
  });

  if (paidCount > 0) {
    throw new Error(`Ada ${paidCount} data gaji yang sudah PAID. Hapus biasa tidak diizinkan.`);
  }

  await prisma.payroll.deleteMany({ where: { batchId } });
  await prisma.payrollBatch.delete({ where: { id: batchId } });

  revalidatePath('/payroll/report');
  return true;
}

export async function forceDeleteBatch(batchId: string) {
  await prisma.payroll.deleteMany({ where: { batchId } });
  await prisma.payrollBatch.delete({ where: { id: batchId } });

  revalidatePath('/payroll/report');
  return true;
}