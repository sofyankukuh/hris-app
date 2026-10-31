// src/app/api/check-duplicates/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return NextResponse.json({ duplicateCount: 0 });

    let duplicateCount = 0;
    for (const row of data) {
      const safeOldNik = row.oldNik ? String(row.oldNik).trim() : null;
      const safeKtpNumber = row.ktpNumber ? String(row.ktpNumber).trim() : null;
      const safeEmail = row.email ? String(row.email).trim() : null;

      // Jika email kosong, kita anggap bukan duplikat (karena nanti akan ditolak di proses simpan)
      if (!safeEmail) continue;

      // Cek Duplikat: HARUS KETIGANYA SAMA (AND)
      const existing = await prisma.employee.findFirst({
        where: {
          tenantId: tenant.id,
          AND: [
            { oldEmployeeNumber: safeOldNik },
            { ktpNumber: safeKtpNumber },
            { email: safeEmail }, // <-- Sekarang aman karena sudah dipastikan tidak null
          ]
        }
      });
      if (existing) duplicateCount++;
    }

    return NextResponse.json({ duplicateCount });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengecek' }, { status: 500 });
  }
}