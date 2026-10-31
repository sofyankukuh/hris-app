import prisma from '@/lib/prisma';

export default async function Home() {
  const totalEmployees = await prisma.employee.count();
  const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-bold text-indigo-500 mb-1 tracking-widest uppercase">Ringkasan Hari Ini</p>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Selamat Datang, Admin 👋</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
        
                {/* Kartu Utama (Kaca Elegan & Redup) */}
        <div className="md:col-span-2 relative p-8 rounded-4xl overflow-hidden bg-white/5 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          {/* Efek Pendaran Cahaya (Glow) di belakang */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-1 tracking-wide">Total Karyawan</p>
              <h2 className="text-6xl font-black text-slate-800 dark:text-white">{totalEmployees}</h2>
            </div>
            <div className="mt-12 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800"></div>
                <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-800"></div>
                <div className="w-8 h-8 rounded-full bg-slate-500 dark:bg-slate-400 border-2 border-white dark:border-slate-800"></div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Karyawan terdaftar</p>
            </div>
          </div>
        </div>

        {/* Kartu 2 (Kaca Transparan) */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md p-7 rounded-4xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col justify-between transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-2xl mb-5 border border-emerald-100 dark:border-emerald-500/20">✅</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Karyawan Aktif</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">{activeEmployees}</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-1.5 rounded-full mt-4">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Kartu 3 (Kaca Transparan) */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md p-7 rounded-4xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col justify-between transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-2xl mb-5 border border-indigo-100 dark:border-indigo-500/20">🏢</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Departemen</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-1">-</h3>
            <p className="text-xs text-slate-400 mt-4 italic">Segera hadir</p>
          </div>
        </div>

      </div>
    </div>
  );
}