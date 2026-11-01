// src/app/(dashboard)/payroll/report/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import DeleteBatchButton from '@/components/DeleteBatchButton';

export default async function PayrollReportBatchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const tenantId = (session.user as any).tenantId;
  const userRole = (session.user as any).role; // <-- Ambil Role

  const batches = await prisma.payrollBatch.findMany({
    where: { tenantId },
    include: { _count: { select: { payrolls: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Laporan Payroll</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Riwayat proses penggajian yang pernah dilakukan.</p>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Periode Gaji</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Tanggal Cut Off</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Tanggal Proses</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Karyawan</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                    {monthNames[b.periodMonth - 1]} {b.periodYear}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {b.cutOffStart.toLocaleDateString('id-ID')} s/d {b.cutOffEnd.toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {b.createdAt.toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {b._count.payrolls} Orang
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/payroll/report/${b.id}`}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100"
                      >
                        Lihat & Aksi
                      </Link>
                      
                      {/* TOMBOL HAPUS (Hanya Superadmin) */}
                      {userRole === 'SUPERADMIN' && (
                        <DeleteBatchButton batchId={b.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada riwayat proses payroll.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}