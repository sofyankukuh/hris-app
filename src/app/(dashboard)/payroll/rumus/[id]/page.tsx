// src/app/(dashboard)/payroll/rumus/[id]/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RumusDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const templateId = resolvedParams.id;

  const template = await prisma.salaryTemplate.findUnique({
    where: { id: templateId },
    include: { details: true }
  });

  if (!template) return <div>Rumus tidak ditemukan</div>;

  const allComponents = await prisma.salaryComponent.findMany({
    orderBy: { name: 'asc' }
  });

  const earnings = allComponents.filter(c => c.type === 'EARNING');
  const deductions = allComponents.filter(c => c.type === 'DEDUCTION');

  // SERVER ACTION: Simpan Ceklis
  async function saveDetails(formData: FormData) {
    'use server';
    
    // 1. Hapus semua detail lama untuk template ini
    await prisma.salaryTemplateDetail.deleteMany({
      where: { salaryTemplateId: templateId }
    });

    // 2. Simpan yang dicentang
    for (const comp of allComponents) {
      if (formData.get(`check_${comp.id}`) === 'on') {
        await prisma.salaryTemplateDetail.create({
          data: { 
            salaryTemplateId: templateId, 
            salaryComponentId: comp.id 
          }
        });
      }
    }

    // 3. Segarkan halaman dan alihkan
    revalidatePath(`/payroll/rumus/${templateId}`);
    revalidatePath('/payroll/rumus');
    redirect('/payroll/rumus');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Atur Ceklis: {template.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Centang komponen yang berlaku untuk rumus ini.</p>
        </div>
        <Link href="/payroll/rumus" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <form action={saveDetails} className="bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <div className="space-y-6">
          {/* EARNING */}
          <div>
            <h3 className="font-bold text-emerald-600 mb-3 text-lg">EARNING (Pendapatan)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {earnings.map(comp => {
                const isChecked = template.details.some(d => d.salaryComponentId === comp.id);
                return (
                  <label key={comp.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <input 
                      type="checkbox" 
                      name={`check_${comp.id}`} 
                      defaultChecked={isChecked} 
                      className="w-5 h-5 text-emerald-600 rounded" 
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{comp.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* DEDUCTION */}
          <div>
            <h3 className="font-bold text-rose-600 mb-3 text-lg">DEDUCTION (Potongan)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deductions.map(comp => {
                const isChecked = template.details.some(d => d.salaryComponentId === comp.id);
                return (
                  <label key={comp.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <input 
                      type="checkbox" 
                      name={`check_${comp.id}`} 
                      defaultChecked={isChecked} 
                      className="w-5 h-5 text-rose-600 rounded" 
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{comp.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
          <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">
            Simpan Ceklis
          </button>
        </div>
      </form>
    </div>
  );
}