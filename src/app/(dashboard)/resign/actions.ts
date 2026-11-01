// src/app/(dashboard)/resign/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function submitResignation(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Anda belum login");

  const employeeId = (session.user as any).id;
  const tenantId = (session.user as any).tenantId;

  const resignDate = new Date(formData.get('resignDate') as string);
  const reason = formData.get('reason') as string;
  const file = formData.get('attachment') as File | null;

  // Upload File
  let attachmentUrl = null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `resign-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await writeFile(path.join(uploadDir, filename), buffer);
    attachmentUrl = `/uploads/${filename}`;
  }

  // Cari AM (sama seperti sebelumnya)
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { role: true }
  });

  if (!employee) throw new Error("Karyawan tidak ditemukan");

  let approverId = null;
  let approverRole = "HC";

  if (employee.role?.name === 'TAD' && employee.branchCode) {
    const amArea = await prisma.amArea.findFirst({
      where: { tenantId, branchCode: employee.branchCode },
      include: { am: true }
    });
    if (amArea) {
      approverId = amArea.amId;
      approverRole = "AM";
    }
  }

  // Simpan Resign
  await prisma.resignation.create({
    data: {
      tenantId,
      employeeId,
      resignDate,
      reason,
      attachmentUrl,
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

  revalidatePath('/resign');
}