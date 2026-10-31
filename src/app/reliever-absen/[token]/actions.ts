// src/app/reliever-absen/[token]/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function submitRelieverAttendance(
  token: string, 
  action: 'IN' | 'OUT', 
  formData: FormData
) {
  const assignment = await prisma.relieverAssignment.findUnique({
    where: { uniqueToken: token }
  });

  if (!assignment) throw new Error("Link tidak valid");

  const lat = parseFloat(formData.get('lat') as string);
  const lng = parseFloat(formData.get('lng') as string);
  const selfie = formData.get('selfie') as File | null;

  let selfieUrl = null;
  if (selfie && selfie.size > 0) {
    const bytes = await selfie.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `reliever-${token}-${Date.now()}.jpg`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await writeFile(path.join(uploadDir, filename), buffer);
    selfieUrl = `/uploads/${filename}`;
  }

  if (action === 'IN') {
    if (assignment.checkIn) throw new Error("Anda sudah Clock In!");
    await prisma.relieverAssignment.update({
      where: { id: assignment.id },
      data: { checkIn: new Date(), lat, lng, selfieUrl }
    });
  } else {
    if (!assignment.checkIn) throw new Error("Anda belum Clock In!");
    if (assignment.checkOut) throw new Error("Anda sudah Clock Out!");
    await prisma.relieverAssignment.update({
      where: { id: assignment.id },
      data: { checkOut: new Date() }
    });
  }

  revalidatePath(`/reliever-absen/${token}`);
}