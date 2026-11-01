// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const userRole = (session?.user as any)?.role || 'TAD';
  
  // State untuk mengontrol buka/tutup sub-menu
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
  kehadiran: pathname.startsWith('/attendance') || pathname.startsWith('/leave') || pathname.startsWith('/approvals') || pathname.startsWith('/resign'),
  reliever: pathname.startsWith('/relievers'),
  keuangan: pathname.startsWith('/incomes') || pathname.startsWith('/payslips'),
  sistem: pathname.startsWith('/employees') || pathname.startsWith('/settings'),
});

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path: string) => pathname === path;
  const isGroupActive = (paths: string[]) => paths.some(p => pathname.startsWith(p));

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  // Helper untuk class menu aktif
  const menuClass = (isActive: boolean) => 
    `flex items-center justify-between w-full px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
      isActive 
        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-transparent dark:border-indigo-500/20" 
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
    }`;

  const subMenuClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ml-4 ${
      isActive 
        ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-500/5" 
        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-[#0f172a]/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/60 flex-col hidden md:flex z-20">
      
      <div className="h-20 flex items-center px-6">
        <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
          HRIS<span className="text-indigo-500">.</span>
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <Link href="/" className={menuClass(isActive("/"))}>
          <div className="flex items-center gap-3"><span className="text-lg">📊</span> Dashboard</div>
        </Link>

        {/* SUB-MENU: KEHADIRAN */}
        <div>
          <button onClick={() => toggleMenu('kehadiran')} className={menuClass(isGroupActive(['/attendance', '/leave', '/approvals']))}>
            <div className="flex items-center gap-3"><span className="text-lg">📅</span> Kehadiran</div>
            <span className="text-xs text-slate-400">{openMenus['kehadiran'] ? '▲' : '▼'}</span>
          </button>
          {openMenus['kehadiran'] && (
            <div className="mt-1 space-y-1">
              <Link href="/attendance" className={subMenuClass(isActive("/attendance"))}>Absensi</Link>
              <Link href="/leave" className={subMenuClass(isActive("/leave"))}>Cuti & Izin</Link>
              <Link href="/approvals" className={subMenuClass(isActive("/approvals"))}>Persetujuan</Link>
              <Link href="/resign" className={subMenuClass(isActive("/resign"))}>Resign</Link>
                            <Link href="/business-trip" className={subMenuClass(isActive("/business-trip"))}>Surat Tugas (SPD)</Link>
            </div>
          )}
        </div>

        {/* SUB-MENU: TENAGA PENGGANTI */}
        <div>
          <button onClick={() => toggleMenu('reliever')} className={menuClass(isGroupActive(['/relievers']))}>
            <div className="flex items-center gap-3"><span className="text-lg">👷</span> Tenaga Pengganti</div>
            <span className="text-xs text-slate-400">{openMenus['reliever'] ? '▲' : '▼'}</span>
          </button>
          {openMenus['reliever'] && (
            <div className="mt-1 space-y-1">
              <Link href="/relievers" className={subMenuClass(isActive("/relievers"))}>Manajemen Reliever</Link>
              <Link href="/relievers/monitor" className={subMenuClass(isActive("/relievers/monitor"))}>Monitor Pengganti</Link>
            </div>
          )}
        </div>

                        {/* SUB-MENU: KEUANGAN */}
        <div>
          <button onClick={() => toggleMenu('keuangan')} className={menuClass(isGroupActive(['/incomes', '/payslips', '/payroll']))}>
            <div className="flex items-center gap-3"><span className="text-lg">💰</span> Keuangan</div>
            <span className="text-xs text-slate-400">{openMenus['keuangan'] ? '▲' : '▼'}</span>
          </button>
          
          {openMenus['keuangan'] && (
            <div className="mt-1 space-y-1">
              <Link href="/incomes" className={subMenuClass(isActive("/incomes"))}>Pendapatan Tambahan</Link>
              <Link href="/payslips" className={subMenuClass(isActive("/payslips"))}>Slip Gaji</Link>
              
              {/* MENU BARU UNTUK RUMUS & PAYROLL */}
              <Link href="/payroll" className={subMenuClass(isActive("/payroll"))}>Payroll</Link>
              <Link href="/payroll/rumus" className={subMenuClass(isActive("/payroll/rumus"))}>Rumus Gaji</Link>
              <Link href="/payroll/terapkan" className={subMenuClass(isActive("/payroll/terapkan"))}>Terapkan Rumus</Link>
              <Link href="/payroll/report" className={subMenuClass(isActive("/payroll/report"))}>Laporan Payroll</Link>            
            </div>
          )}
        </div>

        {/* SUB-MENU: SISTEM (Admin) */}
        <div>
          <button onClick={() => toggleMenu('sistem')} className={menuClass(isGroupActive(['/employees', '/settings']))}>
            <div className="flex items-center gap-3"><span className="text-lg">⚙️</span> Pengaturan</div>
            <span className="text-xs text-slate-400">{openMenus['sistem'] ? '▲' : '▼'}</span>
          </button>
          {openMenus['sistem'] && (
            <div className="mt-1 space-y-1">
              <Link href="/employees" className={subMenuClass(isActive("/employees"))}>Data Karyawan</Link>
              <Link href="/settings/roles" className={subMenuClass(isActive("/settings/roles"))}>Hak Akses</Link>
              <Link href="/settings/am-area" className={subMenuClass(isActive("/settings/am-area"))}>Wilayah AM</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Profil Bawah */}
      <div className="p-4 m-4 bg-slate-50 dark:bg-[#1e293b]/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-indigo-400 font-bold text-sm shadow-sm border border-slate-200/50 dark:border-slate-700">
              {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate w-24">{session?.user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Role: {userRole}</p>
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