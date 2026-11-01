// src/app/(dashboard)/payroll/settings/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function PayrollSettingsPage() {
  const structures = await prisma.salaryStructure.findMany({
    include: { details: { include: { salaryComponent: true } } },
    orderBy: { name: 'asc' }
  });

  // Tambah Struktur Baru
  async function addStructure(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    // Ambil tenantId dari session (asumsi sudah login)
    // Untuk sementara, kita hardcode atau ambil tenant pertama
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error("Tenant tidak ada");

    await prisma.salaryStructure.create({
      data: { tenantId: tenant.id, name, description }
    });

    revalidatePath('/payroll/settings');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pengaturan Struktur Gaji</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Buat "Resep" perhitungan gaji untuk Customer/Departemen.</p>
        </div>
        <Link href="/payroll" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali ke Payroll
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Tambah Struktur */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Buat Struktur Baru</h2>
          <form action={addStructure} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nama Struktur</label>
              <input name="name" required placeholder="Misal: TAD Customer A" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Deskripsi</label>
              <input name="description" placeholder="Penjelasan singkat..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm">
              Buat Struktur
            </button>
          </form>
        </div>

        {/* Daftar Struktur */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Struktur</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Jumlah Komponen</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {structures.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.description || '-'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{s.details.length} Komponen</td>
                    <td className="p-4 text-right">
                      <Link href={`/payroll/settings/${s.id}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100">
                        Atur Komponen
                      </Link>
                    </td>
                  </tr>
                ))}
                {structures.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada struktur gaji.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}