import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRIS Perusahaan",
  description: "Sistem Informasi Manajemen Karyawan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} text-slate-800 dark:text-slate-200 flex h-screen overflow-hidden antialiased`}>
        
        {/* Sidebar Desktop */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 flex-col hidden md:flex z-20">
          <div className="h-20 flex items-center px-6">
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              HRIS<span className="text-indigo-500">.</span>
            </span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all font-medium text-sm">
              <span className="text-lg">📊</span> Dashboard
            </Link>
            <Link href="/employees" className="flex items-center gap-3 px-4 py-3 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl font-semibold text-sm transition-all">
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
          <div className="p-4 m-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm border border-slate-200/50 dark:border-slate-600">A</div>
                <div>
                   <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Admin HR</p>
                   <p className="text-[11px] text-slate-500 dark:text-slate-400">admin@perusahaan.com</p>
                </div>
             </div>
          </div>
        </aside>

        {/* Konten Utama */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 md:px-10 sticky top-0 z-10">
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Workspace</h2>
             <div className="flex items-center gap-5">
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition text-lg">🔔</button>
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs md:hidden">A</div>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>

        {/* Bottom Nav Mobile */}
        <div className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 flex justify-around items-center h-20 z-50">
            <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-slate-400 dark:text-slate-500">
              <span className="text-xl mb-1">📊</span>
              <span className="text-[10px] font-semibold">Dashboard</span>
            </Link>
            <Link href="/employees" className="flex flex-col items-center justify-center w-full h-full text-indigo-600 dark:text-indigo-400">
              <span className="text-xl mb-1">👥</span>
              <span className="text-[10px] font-bold">Karyawan</span>
            </Link>
        </div>
      </body>
    </html>
  );
}