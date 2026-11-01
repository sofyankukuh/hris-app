// src/app/(dashboard)/payroll/terapkan/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function ApplyTemplatePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ customer?: string, branchCode?: string, position?: string }> 
}) {
  const params = await searchParams;
  const customer = params.customer || '';
  const branchCode = params.branchCode || '';
  const position = params.position || '';

  // Ambil opsi filter
  const customers = await prisma.employee.findMany({ select: { customer: true }, distinct: ['customer'], where: { customer: { not: null } } });
  const branches = await prisma.employee.findMany({ select: { branchCode: true }, distinct: ['branchCode'], where: { branchCode: { not: null } } });
  const positions = await prisma.employee.findMany({ select: { position: true }, distinct: ['position'] });

  // Ambil karyawan dengan filter
  const employees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      customer: customer ? customer : undefined,
      branchCode: branchCode ? branchCode : undefined,
      position: position ? position : undefined,
    },
    include: { 
      salaryTemplate: { 
        include: { salaryTemplate: true } // <-- Ambil nama rumus
      } 
    },
    orderBy: { fullName: 'asc' }
  });

  const templates = await prisma.salaryTemplate.findMany({ orderBy: { name: 'asc' } });

  async function applyTemplate(formData: FormData) {
    'use server';
    const templateId = formData.get('templateId') as string;
    
    for (const emp of employees) {
      if (formData.get(`check_${emp.id}`) === 'on') {
        await prisma.employeeSalaryTemplate.upsert({
          where: { employeeId: emp.id },
          update: { salaryTemplateId: templateId },
          create: { employeeId: emp.id, salaryTemplateId: templateId }
        });
      }
    }
    revalidatePath('/payroll/terapkan');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Terapkan Rumus Gaji</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pilih rumus, filter karyawan, lalu centang yang akan diterapkan.</p>
        </div>
        <Link href="/payroll" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <form action={applyTemplate}>
        <div className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">Pilih Rumus:</label>
            <select name="templateId" required className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm w-64">
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button type="submit" className="ml-auto px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">
            Terapkan ke Karyawan Terpilih
          </button>
        </div>

        {/* Filter Baris */}
        <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Filter Customer</label>
            <select name="customer" defaultValue={customer} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Semua Customer</option>
              {customers.map(c => <option key={c.customer} value={c.customer!}>{c.customer}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Filter Cabang</label>
            <select name="branchCode" defaultValue={branchCode} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Semua Cabang</option>
              {branches.map(b => <option key={b.branchCode} value={b.branchCode!}>{b.branchCode}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Filter Jabatan</label>
            <select name="position" defaultValue={position} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
              <option value="">Semua Jabatan</option>
              {positions.map(p => <option key={p.position} value={p.position}>{p.position}</option>)}
            </select>
          </div>
          <button type="submit" formAction="/payroll/terapkan" formMethod="GET" className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-sm">
            Terapkan Filter
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 w-16 text-center">Pilih</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Karyawan</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Jabatan / Cabang</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Rumus Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 text-center">
                    <input type="checkbox" name={`check_${emp.id}`} className="w-5 h-5 text-indigo-600 rounded" />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{emp.fullName}</p>
                    <p className="text-xs text-slate-500">{emp.employeeNumber}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {emp.position} / {emp.branchCode}
                  </td>
                  <td className="p-4 text-sm">
                    {emp.salaryTemplate?.salaryTemplate ? (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100">
                        {emp.salaryTemplate.salaryTemplate.name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Belum diset</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}