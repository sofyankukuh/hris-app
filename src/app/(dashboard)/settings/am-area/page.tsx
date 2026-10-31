// src/app/(dashboard)/settings/am-area/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';
import DownloadTemplateAmArea from '@/components/DownloadTemplateAmArea';

export default async function AmAreaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const tenantId = (session.user as any).tenantId;

  // Ambil data AM Area beserta nama AM-nya
  const amAreas = await prisma.amArea.findMany({
    where: { tenantId },
    include: { am: true },
    orderBy: { am: { fullName: 'asc' } }
  });

  // Ambil daftar AM untuk dropdown
  const ams = await prisma.employee.findMany({
    where: { tenantId, role: { name: 'AM' } },
    orderBy: { fullName: 'asc' }
  });

  // Server Action untuk tambah manual
  async function addAmArea(formData: FormData) {
    'use server';
    const amId = formData.get('amId') as string;
    const branchCode = formData.get('branchCode') as string;

    await prisma.amArea.upsert({
      where: { amId_branchCode: { amId, branchCode } },
      update: {},
      create: { tenantId, amId, branchCode }
    });

    revalidatePath('/settings/am-area');
  }

  // Server Action untuk upload Excel
  async function uploadAmArea(formData: FormData) {
    'use server';
    const file = formData.get('file') as File;
    if (!file) throw new Error('File tidak ditemukan');

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(bytes), { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    for (const row of data) {
      const nikAm = String(row['NIK AM']).trim();
      const branchCode = String(row['Kode Cabang']).trim();

      // Cari ID AM berdasarkan NIK
      const am = await prisma.employee.findFirst({
        where: { tenantId, employeeNumber: nikAm }
      });

      if (am) {
        await prisma.amArea.upsert({
          where: { amId_branchCode: { amId: am.id, branchCode } },
          update: {},
          create: { tenantId, amId: am.id, branchCode }
        });
      }
    }

    revalidatePath('/settings/am-area');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Wilayah Kerja AM</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Atur cabang mana saja yang diawasi oleh Area Manager.</p>
        </div>
        <Link href="/settings/roles" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      {/* Form Tambah & Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Tambah Manual */}
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Tambah Manual</h2>
          <form action={addAmArea} className="space-y-3">
            <select name="amId" required className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Pilih AM...</option>
              {ams.map(am => <option key={am.id} value={am.id}>{am.fullName}</option>)}
            </select>
            <input name="branchCode" required placeholder="Kode Cabang (misal: BR01)" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm">Tambah</button>
          </form>
        </div>

        {/* Upload Excel */}
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Upload Excel</h2>
            <DownloadTemplateAmArea />
          </div>
          <form action={uploadAmArea} className="space-y-3">
            <input name="file" type="file" accept=".xlsx, .xls" required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
            <button type="submit" className="w-full py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 text-sm">Upload</button>
          </form>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama AM</th>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">NIK AM</th>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Kode Cabang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {amAreas.map((area) => (
              <tr key={area.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{area.am.fullName}</td>
                <td className="p-4 text-sm text-slate-600">{area.am.employeeNumber}</td>
                <td className="p-4 text-sm font-bold text-indigo-600 bg-indigo-50/50 rounded-lg inline-block mt-2">{area.branchCode}</td>
              </tr>
            ))}
            {amAreas.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada data wilayah kerja.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}