// src/app/(dashboard)/business-trip/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export async function submitBusinessTrip(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Anda belum login");

  const employeeId = (session.user as any).id;
  const tenantId = (session.user as any).tenantId;

  const destination = formData.get('destination') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const purpose = formData.get('purpose') as string;

  // Cari atasan langsung (Sama seperti Cuti/Resign)
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { role: true }
  });

  if (!employee) throw new Error("Karyawan tidak ditemukan");

  let approverId = null;
  let approverRole = "HC";

  // Karyawan Kantor Pusat (Role selain TAD) biasanya langsung ke HC
  // Tapi jika ada Manager, kita bisa arahkan ke Manager
  if (employee.role?.name === 'TAD' && employee.branchCode) {
    const amArea = await prisma.amArea.findFirst({
      where: { tenantId, branchCode: employee.branchCode }
    });
    if (amArea) {
      approverId = amArea.amId;
      approverRole = "AM";
    }
  }

  await prisma.businessTrip.create({
    data: {
      tenantId,
      employeeId,
      destination,
      startDate,
      endDate,
      purpose,
      status: 'PENDING',
      approvals: {
        create: {
          approverId: approverId || (session.user as any).id,
          role: approverRole,
          status: 'WAITING'
        }
      }
    }
  });

  revalidatePath('/business-trip');
}