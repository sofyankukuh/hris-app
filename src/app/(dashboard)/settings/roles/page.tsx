// src/app/(dashboard)/settings/roles/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function SettingsPage() {
  const pengelolaCount = await prisma.employee.count({
    where: { role: { name: { not: 'TAD' } } }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Hak Akses</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Atur hak akses khusus untuk Karyawan Pengelola.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* KARTU PENGELOLA */}
        <Link 
          href="/settings/access"
          className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                Hak Akses Pengelola
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Atur fitur spesifik untuk masing-masing individu (HC, Legal, IT, Manager).
              </p>
            </div>
          </div>
          <div className="text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl">
            {pengelolaCount} Karyawan
          </div>
        </Link>

        {/* KARTU MANAJEMEN AKUN */}
        <Link 
          href="/settings/access"
          className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
                Manajemen Akun & Identitas
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Ubah Kategori (Role), atur password, dan filter berdasarkan cabang.
              </p>
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-xl">
            Kelola
          </div>
        </Link>

        {/* INFO TAD & CLIENT */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Akses Otomatis (Paten)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Karyawan dengan kategori <strong>TAD</strong> dan <strong>Client</strong> memiliki fitur standar yang sudah dikunci oleh sistem (tidak perlu diatur manual). 
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}