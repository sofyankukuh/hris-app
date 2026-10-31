// src/app/(dashboard)/leave/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function submitLeaveRequest(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Anda belum login");

  const employeeId = (session.user as any).id;
  const tenantId = (session.user as any).tenantId;

  // 1. Ambil data TAD yang mengajukan
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { role: true }
  });
  if (!employee) throw new Error("Data karyawan tidak ditemukan");

  const type = formData.get('type') as string;
  const startDate = new Date(formData.get('startDate') as string);
  const endDate = new Date(formData.get('endDate') as string);
  const reason = formData.get('reason') as string;
  const file = formData.get('attachment') as File | null;

  // Hitung total hari
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // 2. Logika Upload File
  let attachmentUrl = null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await writeFile(path.join(uploadDir, filename), buffer);
    attachmentUrl = `/uploads/${filename}`;
  }

  // 3. LOGIKA PENCARIAN ATASAN (AM Area)
  let approverId = null;
  let approverRole = "HC"; // Default langsung ke HC jika tidak ada AM

  if (employee.role?.name === 'TAD' && employee.branchCode) {
    // Cari AM yang mengawasi cabang TAD ini melalui tabel AmArea
    const amArea = await prisma.amArea.findFirst({
      where: {
        tenantId: tenantId,
        branchCode: employee.branchCode
      },
      include: { am: true }
    });

    if (amArea) {
      approverId = amArea.amId;
      approverRole = "AM";
    }
  }

  // 4. Simpan Pengajuan & Buat Approval Step
  await prisma.leaveRequest.create({
    data: {
      tenantId,
      employeeId,
      type,
      startDate,
      endDate,
      totalDays,
      reason,
      attachmentUrl,
      status: 'PENDING',
      approvals: {
        create: {
          approverId: approverId || (session.user as any).id, // Fallback ke diri sendiri jika tidak ada AM
          role: approverRole,
          status: 'WAITING'
        }
      }
    }
  });

  revalidatePath('/leave');
}