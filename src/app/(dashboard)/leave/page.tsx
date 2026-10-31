// src/app/(dashboard)/leave/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { submitLeaveRequest } from './actions';
import { redirect } from 'next/navigation';

export default async function LeavePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const employeeId = (session.user as any).id;

  const history = await prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pengajuan Cuti & Izin</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ajukan cuti atau izin Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Pengajuan */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Form Pengajuan</h2>
          
          {/* Tambahkan encType di sini */}
          <form action={submitLeaveRequest} encType="multipart/form-data" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Jenis</label>
              <select name="type" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                <option value="CUTI">Cuti Tahunan</option>
                <option value="IZIN">Izin (Mendesak)</option>
                <option value="SAKIT">Sakit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Mulai Tanggal</label>
              <input name="startDate" type="date" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Selesai Tanggal</label>
              <input name="endDate" type="date" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Alasan</label>
              <textarea name="reason" rows={3} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"></textarea>
            </div>

            {/* Input File Lampiran */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Lampiran (Opsional)</label>
              <input 
                name="attachment" 
                type="file" 
                accept="image/*, .pdf" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
            </div>

            <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
              Kirim Pengajuan
            </button>
          </form>
        </div>

        {/* Riwayat Pengajuan */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Riwayat Pengajuan</h2>
            
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Belum ada riwayat pengajuan.</p>
            ) : (
              <div className="space-y-3">
                {history.map((req) => (
                  <div key={req.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{req.type}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {req.startDate.toLocaleDateString('id-ID')} s/d {req.endDate.toLocaleDateString('id-ID')} ({req.totalDays} Hari)
                      </p>
                      {/* Tombol Lihat Lampiran */}
                      {req.attachmentUrl && (
                        <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-2 inline-block">
                          📎 Lihat Lampiran
                        </a>
                      )}
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