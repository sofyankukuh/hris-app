// src/app/(dashboard)/payroll/rumus/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function RumusPage() {
  const templates = await prisma.salaryTemplate.findMany({
    include: { details: true },
    orderBy: { name: 'asc' }
  });

  async function addTemplate(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return;

    await prisma.salaryTemplate.create({
      data: { tenantId: tenant.id, name, description }
    });
    revalidatePath('/payroll/rumus');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daftar Rumus Gaji</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Buat template centang untuk diterapkan ke karyawan.</p>
        </div>
        <Link href="/payroll" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Buat Rumus Baru</h2>
          <form action={addTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nama Rumus</label>
              <input name="name" required placeholder="Misal: Rumus TAD Customer A" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Deskripsi</label>
              <input name="description" placeholder="Penjelasan singkat..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm">Buat Rumus</button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Rumus</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Komponen</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.description || '-'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{t.details.length} Komponen</td>
                    <td className="p-4 text-right">
                      <Link href={`/payroll/rumus/${t.id}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100">
                        Atur Ceklis
                      </Link>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada rumus.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}