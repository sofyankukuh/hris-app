import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { fullName: 'asc' },
  });

  async function addEmployee(formData: FormData) {
    'use server';
    const fullName = formData.get('fullName') as string;
    const employeeNumber = formData.get('employeeNumber') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const position = formData.get('position') as string;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error('Tenant tidak ditemukan');

    await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        fullName, employeeNumber, email, department, position,
        joinDate: new Date(),
        status: 'ACTIVE',
      }
    });

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
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-8">
      
      {/* DAFTAR KARYAWAN (KIRI) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Data Karyawan</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Total {employees.length} orang terdaftar</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          {employees.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
              <div className="text-5xl mb-4 opacity-50">👥</div>
              <p className="font-semibold">Belum ada data</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {employees.map((emp) => (
                <div key={emp.id} className="bg-white dark:bg-slate-800/80 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(emp.fullName)}`}>
                      {getInitials(emp.fullName)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">{emp.fullName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{emp.department}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{emp.position}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{emp.employeeNumber}</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {emp.status === 'ACTIVE' ? 'Aktif' : emp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FORM TAMBAH (KANAN) */}
      <div className="w-full md:w-[380px] shrink-0">
        <div className="bg-white dark:bg-slate-800/80 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 shadow-sm sticky top-0">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Karyawan Baru</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lengkapi form untuk menambahkan data.</p>
          </div>
          
          <form action={addEmployee} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <input name="fullName" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" placeholder="Budi Santoso" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">NIK</label>
              <input name="employeeNumber" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" placeholder="EMP-001" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" placeholder="budi@perusahaan.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Dept.</label>
                <input name="department" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" placeholder="IT" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jabatan</label>
                <input name="position" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" placeholder="Staff" />
              </div>
            </div>
            
            <button type="submit" className="w-full mt-4 px-6 py-3.5 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-sm active:scale-[0.98]">
              Simpan Data
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}