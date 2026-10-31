// src/app/reliever-absen/[token]/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function RelieverAbsenPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  const assignment = await prisma.relieverAssignment.findUnique({
    where: { uniqueToken: token },
    include: { reliever: true }
  });

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Link Tidak Valid</h1>
          <p className="text-slate-500">Link absensi ini sudah kadaluarsa atau tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold">Absensi Reliever</h1>
          <p className="text-indigo-200 text-sm mt-1">Silakan lakukan Clock In/Out</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Reliever */}
          <div className="text-center">
            <p className="text-sm text-slate-500">Nama Reliever</p>
            <p className="text-lg font-bold text-slate-800">{assignment.reliever.fullName}</p>
            <p className="text-sm text-slate-500 mt-2">Tanggal Tugas</p>
            <p className="font-medium text-slate-800">{assignment.date.toLocaleDateString('id-ID')}</p>
          </div>

          {/* Tombol Absen (Sementara UI) */}
          <div className="space-y-3">
            <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-md">
              Clock In (Ambil Selfie)
            </button>
            <button className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 shadow-md">
              Clock Out
            </button>
          </div>

          <p className="text-xs text-center text-slate-400">
            Sistem akan meminta izin kamera dan lokasi Anda.
          </p>
        </div>
      </div>
    </div>
  );
}