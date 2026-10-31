// src/app/(dashboard)/incomes/import/actions.ts
"use server";

import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

// Helper parse tanggal (DD-MM-YYYY)
const parseDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  if (typeof dateStr === 'number') {
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
  }
  const str = String(dateStr).trim();
  const parts = str.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

export async function importIncomes(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Anda belum login");
  const tenantId = (session.user as any).tenantId;

  const file = formData.get('file') as File;
  if (!file) throw new Error("File tidak ditemukan");

  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(Buffer.from(bytes), { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  let successCount = 0;
  let failCount = 0;

  for (const row of data) {
    const nik = String(row['NIK']).trim();
    const type = String(row['Jenis (LEMBUR/SPD/OPD)']).toUpperCase();
    const date = parseDate(row['Tanggal (DD-MM-YYYY)']);
    const amount = parseFloat(row['Nominal']);
    const description = row['Keterangan'] ? String(row['Keterangan']) : null;

    if (!nik || !date || isNaN(amount) || !['LEMBUR', 'SPD', 'OPD'].includes(type)) {
      failCount++;
      continue;
    }

    // Cari karyawan berdasarkan NIK
    const employee = await prisma.employee.findFirst({
      where: { tenantId, employeeNumber: nik }
    });

    if (!employee) {
      failCount++;
      continue;
    }

    await prisma.additionalIncome.create({
      data: {
        tenantId,
        employeeId: employee.id,
        type,
        date,
        amount,
        description
      }
    });
    successCount++;
  }

  revalidatePath('/incomes');
  return { successCount, failCount };
}