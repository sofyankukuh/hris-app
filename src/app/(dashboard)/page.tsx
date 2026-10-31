// src/app/(dashboard)/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const employeeId = (session.user as any).id;
  const userRole = (session.user as any).role;
  const tenantId = (session.user as any).tenantId;

  // ==========================================
  // TAMPILAN 1: KHUSUS TAD (Karyawan Biasa)
  // ==========================================
  if (userRole === 'TAD') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Halo, Selamat Bekerja! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ini adalah portal pribadi Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kartu Absensi */}
          <Link href="/attendance" className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl mb-4 group-hover:scale-110 transition-transform">📅</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Absensi</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lakukan Clock In dan Clock Out harian Anda.</p>
          </Link>

          {/* Kartu Cuti */}
          <Link href="/leave" className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl mb-4 group-hover:scale-110 transition-transform">🌴</div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cuti & Izin</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ajukan cuti atau lihat sisa jatah cuti Anda.</p>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN 2: PENGELOLA (HC, AM, IT, Legal, dll)
  // ==========================================
  const totalEmployees = await prisma.employee.count({ where: { tenantId } });
  const activeEmployees = await prisma.employee.count({ where: { tenantId, status: 'ACTIVE' } });
  const pendingApprovals = await prisma.approvalStep.count({
    where: { approverId: employeeId, status: 'WAITING' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold text-indigo-500 mb-1 tracking-widest uppercase">Ringkasan Hari Ini</p>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Selamat Datang, {session.user.name} 👋</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu 1: Total Karyawan */}
        <div className="bg-white dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Karyawan</p>
          <h3 className="text-4xl font-black text-slate-800 dark:text-white mt-2">{totalEmployees}</h3>
          <p className="text-xs text-slate-400 mt-2">Aktif: {activeEmployees} orang</p>
        </div>

        {/* Kartu 2: Menunggu Persetujuan */}
        <Link href="/approvals" className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-indigo-100">Menunggu Persetujuan Anda</p>
            <h3 className="text-4xl font-black mt-2">{pendingApprovals}</h3>
            <p className="text-xs text-indigo-100 mt-2 flex items-center gap-1">Lihat Detail &rarr;</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>
        </Link>

        {/* Kartu 3: Monitor Absensi */}
        <Link href="/attendance/manage" className="bg-white dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Monitor Absensi</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-2">Lihat Kehadiran</h3>
          <p className="text-xs text-indigo-500 mt-2">Cek TAD yang sudah Clock In &rarr;</p>
        </Link>
      </div>
    </div>
  );
}