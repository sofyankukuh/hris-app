// src/app/(dashboard)/resign/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import ResignForm from '@/components/ResignForm';

export default async function ResignPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const employeeId = (session.user as any).id;

  const history = await prisma.resignation.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pengajuan Resign</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ajukan pengunduran diri Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Pengajuan */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Form Resign</h2>
          
          {/* Cukup Panggil Komponen Ini */}
          <ResignForm />
          
        </div>

        {/* Riwayat Pengajuan */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Riwayat Resign</h2>
            
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Belum ada pengajuan resign.</p>
            ) : (
              <div className="space-y-3">
                {history.map((req) => (
                  <div key={req.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Resign</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tanggal Terakhir: {req.resignDate.toLocaleDateString('id-ID')}
                      </p>
                      
                      {req.attachmentUrl && (
                        <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline mt-2 inline-block">
                          📎 Lihat Surat Resign
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