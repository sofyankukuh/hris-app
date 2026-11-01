// src/app/(dashboard)/payroll/settings/[id]/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StructureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const structureId = resolvedParams.id;

  const structure = await prisma.salaryStructure.findUnique({
    where: { id: structureId },
    include: { 
      details: { include: { salaryComponent: true } } 
    }
  });

  if (!structure) return <div>Struktur tidak ditemukan</div>;

  // Ambil semua master komponen
  const allComponents = await prisma.salaryComponent.findMany({
    orderBy: { name: 'asc' }
  });

  // Server Action untuk tambah komponen ke struktur
  async function addComponent(formData: FormData) {
    'use server';
    const salaryComponentId = formData.get('salaryComponentId') as string;
    const calculationType = formData.get('calculationType') as string;
    const defaultValue = parseFloat(formData.get('defaultValue') as string);

    await prisma.salaryStructureDetail.create({
      data: {
        salaryStructureId: structureId,
        salaryComponentId,
        calculationType,
        defaultValue
      }
    });

    revalidatePath(`/payroll/settings/${structureId}`);
  }

  // Server Action untuk hapus komponen
  async function removeComponent(formData: FormData) {
    'use server';
    const detailId = formData.get('detailId') as string;
    await prisma.salaryStructureDetail.delete({ where: { id: detailId } });
    revalidatePath(`/payroll/settings/${structureId}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Atur Komponen: {structure.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{structure.description}</p>
        </div>
        <Link href="/payroll/settings" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Tambah Komponen */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Tambah Komponen</h2>
          <form action={addComponent} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Pilih Komponen</label>
              <select name="salaryComponentId" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                {allComponents.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Tipe Perhitungan</label>
              <select name="calculationType" required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                <option value="FIXED">Nominal Tetap (Rp)</option>
                <option value="PERCENTAGE">Persentase dari Gaji Pokok (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nilai Default</label>
              <input name="defaultValue" type="number" required placeholder="Misal: 500000 atau 2" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm">
              Tambahkan
            </button>
          </form>
        </div>

        {/* Daftar Komponen dalam Struktur */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Komponen</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Tipe</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nilai</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {structure.details.map((detail) => (
                  <tr key={detail.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                      {detail.salaryComponent.name}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-md ${
                        detail.salaryComponent.type === 'EARNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {detail.salaryComponent.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{detail.calculationType}</td>
                    <td className="p-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                      {detail.calculationType === 'FIXED' 
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(detail.defaultValue)
                        : `${detail.defaultValue}%`}
                    </td>
                    <td className="p-4 text-right">
                      <form action={removeComponent}>
                        <input type="hidden" name="detailId" value={detail.id} />
                        <button type="submit" className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100">Hapus</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {structure.details.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada komponen. Silakan tambahkan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}