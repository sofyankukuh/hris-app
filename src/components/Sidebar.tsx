// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#0f172a]/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/60 flex-col hidden md:flex z-20">
      
      <div className="h-20 flex items-center px-6">
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          HRIS<span className="text-indigo-500">.</span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
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

        <Link 
          href="/settings/roles" 
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
            isActive("/settings/roles") 
              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-transparent dark:border-indigo-500/20" 
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span className="text-lg">🛡️</span> Hak Akses
        </Link>
        
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60">
            <span className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Menu Utama</span>
            <div className="mt-3 space-y-1">
              
              {/* MENU ABSENSI (Dinamis berdasarkan .env) */}
              {process.env.NEXT_PUBLIC_ENABLE_ATTENDANCE === 'true' ? (
                <Link 
                  href="/attendance" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                    isActive("/attendance") 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-transparent dark:border-indigo-500/20" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className="text-lg">📅</span> Absensi
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 text-slate-300 dark:text-slate-600 cursor-not-allowed rounded-2xl font-medium text-sm">
                  <span className="text-lg opacity-50">📅</span> Absensi
                </div>
              )}

              {/* Menu Cuti & Penggajian (Masih statis untuk sekarang) */}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-indigo-400 font-bold text-sm shadow-sm border border-slate-200/50 dark:border-slate-700">A</div>
            <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Super Admin</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@hris.com</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
            title="Keluar / Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}