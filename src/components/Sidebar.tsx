"use client"; // Wajib ditambahkan karena kita menggunakan hook usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  // Fungsi untuk mengecek apakah menu sedang aktif
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white dark:bg-[#0f172a]/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/60 flex-col hidden md:flex z-20">
      <div className="h-20 flex items-center px-6">
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          HRIS<span className="text-indigo-500">.</span>
        </span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        
        {/* Menu Dashboard */}
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            isActive("/") 
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-transparent dark:border-indigo-500/20" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="text-lg">📊</span> Dashboard
        </Link>

        {/* Menu Karyawan */}
        <Link 
          href="/employees" 
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            isActive("/employees") 
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-transparent dark:border-indigo-500/20" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="text-lg">👥</span> Karyawan
        </Link>
        
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60">
            <span className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Segera Hadir</span>
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-2xl font-medium text-sm">
                <span className="text-lg opacity-50">📅</span> Absensi
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-2xl font-medium text-sm">
                <span className="text-lg opacity-50">🌴</span> Cuti
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-2xl font-medium text-sm">
                <span className="text-lg opacity-50">💰</span> Penggajian
              </div>
            </div>
        </div>
      </nav>
      <div className="p-4 m-4 bg-slate-50 dark:bg-[#1e293b]/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-indigo-400 font-bold text-sm shadow-sm border border-slate-200/50 dark:border-slate-700">A</div>
            <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Admin HR</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@perusahaan.com</p>
            </div>
          </div>
      </div>
    </aside>
  );
}