// src/app/(dashboard)/business-trip/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitBusinessTrip } from './actions';
import { redirect } from 'next/navigation';

export default async function BusinessTripPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const employeeId = (session.user as any).id;

  const history = await prisma.businessTrip.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Surat Perjalanan Dinas (SPD)</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ajukan perjalanan dinas Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Pengajuan */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Form Pengajuan SPD</h2>
          <form action={submitBusinessTrip} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Kota Tujuan</label>
              <input name="destination" type="text" required placeholder="Contoh: Bandung" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Tanggal Mulai</label>
              <input name="startDate" type="date" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Tanggal Selesai</label>
              <input name="endDate" type="date" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Keperluan Dinas</label>
              <textarea name="purpose" rows={3} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" placeholder="Contoh: Meeting dengan client..."></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
              Kirim Pengajuan SPD
            </button>
          </form>
        </div>

        {/* Riwayat Pengajuan */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Riwayat SPD</h2>
            
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Belum ada pengajuan SPD.</p>
            ) : (
              <div className="space-y-3">
                {history.map((req) => (
                  <div key={req.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">SPD ke {req.destination}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {req.startDate.toLocaleDateString('id-ID')} s/d {req.endDate.toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                      req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}