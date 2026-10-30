// src/app/employees/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { fullName: 'asc' },
  });

  async function removeEmployee(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    try {
      await prisma.employee.delete({ where: { id } });
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
    revalidatePath('/employees');
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
      'bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
      'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Data Karyawan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Total {employees.length} orang terdaftar</p>
        </div>
        {/* TOMBOL INI AKAN MUNCUL */}
        <Link href="/employees/create" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] flex items-center gap-2">
          <span className="text-lg">+</span> Tambah Karyawan
        </Link>
      </div>

      {/* Daftar Karyawan */}
      <div className="flex flex-col gap-3">
        {employees.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4 opacity-50">👥</div>
            <p className="font-semibold text-lg">Belum ada data karyawan</p>
            <p className="text-sm mt-1">Klik tombol Tambah Karyawan untuk memulai.</p>
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-all group gap-4">
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${getAvatarColor(emp.fullName)}`}>
                  {getInitials(emp.fullName)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">{emp.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-xs">{emp.employeeNumber}</span>
                    <span>{emp.department}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{emp.position}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  emp.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {emp.status === 'ACTIVE' ? 'Aktif' : emp.status}
                </span>

                <div className="flex items-center gap-1 pl-4 border-l border-slate-100 dark:border-slate-700">
                  <Link href={`/employees/edit/${emp.id}`} className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-colors" title="Edit Karyawan">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Link>
                  
                                    {/* GANTI BAGIAN FORM LAMA DENGAN INI */}
                                    <DeleteButton formAction={removeEmployee} id={emp.id} />
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}