// src/app/(dashboard)/attendance/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Import konfigurasi
import { revalidatePath } from 'next/cache';

export async function handleAttendance(action: 'IN' | 'OUT') {
  // Ambil sesi menggunakan getServerSession
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Anda belum login");
  }

  const employeeId = (session.user as any).id;
  const tenantId = (session.user as any).tenantId; 

  if (!employeeId || !tenantId) {
    throw new Error("Data sesi tidak lengkap. Silakan logout dan login kembali.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId: employeeId,
        date: today,
      }
    }
  });

  if (action === 'IN') {
    if (existing?.checkIn) throw new Error("Anda sudah Clock In hari ini!");
    
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      update: { checkIn: new Date() },
      create: {
        tenantId: tenantId,
        employeeId: employeeId,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT'
      }
    });
  } else {
    if (!existing?.checkIn) throw new Error("Anda belum Clock In hari ini!");
    if (existing?.checkOut) throw new Error("Anda sudah Clock Out hari ini!");

    await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut: new Date() }
    });
  }

  revalidatePath('/attendance');
}

export async function getTodayAttendance() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const employeeId = (session.user as any).id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: { employeeId, date: today }
    }
  });

  return attendance;
}