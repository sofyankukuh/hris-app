// src/app/(dashboard)/attendance/manage/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ManageAttendancePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const employeeId = (session.user as any).id;
  const tenantId = (session.user as any).tenantId;
  const params = await searchParams;
  const query = params.query || '';

  // 1. Cek Hak Akses
  const hasAccess = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      permissions: { some: { name: 'attendance:manage' } }
    }
  });

  if (!hasAccess) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500">Anda tidak memiliki izin untuk mengelola absensi.</p>
        <Link href="/attendance" className="text-indigo-500 hover:underline mt-4 inline-block">Kembali ke Absensi</Link>
      </div>
    );
  }

  // 2. Ambil Tanggal Hari Ini (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Ambil Data Karyawan TAD & Absensinya Hari Ini
  const employees = await prisma.employee.findMany({
    where: {
      tenantId: tenantId,
      role: { name: 'TAD' },
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { employeeNumber: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      attendances: {
        where: { date: today }
      }
    },
    orderBy: { fullName: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Monitor Absensi Hari Ini</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link href="/attendance" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali ke Absensi
        </Link>
      </div>

      {/* Pencarian */}
      <form className="mb-6 flex gap-2" action="/attendance/manage" method="GET">
        <input 
          type="text" 
          name="query" 
          defaultValue={query}
          className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" 
          placeholder="Cari nama atau NIK TAD..." 
        />
        <button type="submit" className="px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors text-sm">
          Cari
        </button>
      </form>

      {/* Tabel Monitor */}
      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Karyawan</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">NIK</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Jam Masuk</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Jam Keluar</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {employees.map((emp) => {
                const attendance = emp.attendances[0];
                const checkIn = attendance?.checkIn;
                const checkOut = attendance?.checkOut;
                
                // Logika Status
                let statusBadge = <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold">Belum Absen</span>;
                if (checkIn && !checkOut) {
                  statusBadge = <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">Sedang Bekerja</span>;
                } else if (checkIn && checkOut) {
                  statusBadge = <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">Selesai</span>;
                }

                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{emp.fullName}</p>
                      <p className="text-xs text-slate-500">{emp.department}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">{emp.employeeNumber}</td>
                    <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {checkIn ? checkIn.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {checkOut ? checkOut.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="p-4">{statusBadge}</td>
                  </tr>
                );
              })}
              
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    Tidak ada data TAD yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}