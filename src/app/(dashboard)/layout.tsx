// src/app/(dashboard)/layout.tsx
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <header className="h-20 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6 md:px-10 sticky top-0 z-10">
           <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Workspace</h2>
           <div className="flex items-center gap-5">
              <div className="text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition text-lg">🔔</div>
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs md:hidden">A</div>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <div className="md:hidden fixed bottom-0 w-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 flex justify-around items-center h-20 z-50">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-slate-400 dark:text-slate-500 hover:text-indigo-500">
            <span className="text-xl mb-1">📊</span>
            <span className="text-[10px] font-semibold">Dashboard</span>
          </Link>
          <Link href="/employees" className="flex flex-col items-center justify-center w-full h-full text-slate-400 dark:text-slate-500 hover:text-indigo-500">
            <span className="text-xl mb-1">👥</span>
            <span className="text-[10px] font-semibold">Karyawan</span>
          </Link>
      </div>
    </div>
  );
}