// src/app/(dashboard)/relievers/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function RelieversPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  
    // Ambil SEMUA pengajuan cuti (untuk ditampilkan di UI)
  const approvedLeaves = await prisma.leaveRequest.findMany({
    include: {
      employee: true,
      relieverAssignment: {
        include: { reliever: true }
      }
    },
    orderBy: { startDate: 'desc' }
  });

  // Server Action untuk menyimpan Reliever
    async function assignReliever(formData: FormData) {
    'use server';
    const leaveRequestId = formData.get('leaveRequestId') as string;
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const email = formData.get('email') as string;
    const ktpNumber = formData.get('ktpNumber') as string;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId }
    });
    if (!leaveRequest) throw new Error("Pengajuan tidak ditemukan");

    // Buat Reliever
    const reliever = await prisma.reliever.create({
      data: { tenantId: leaveRequest.tenantId, fullName, phoneNumber, email, ktpNumber }
    });

    // Buat Assignment (Token otomatis terbuat dari default cuid)
    const assignment = await prisma.relieverAssignment.create({
      data: {
        tenantId: leaveRequest.tenantId,
        leaveRequestId: leaveRequest.id,
        relieverId: reliever.id,
        date: leaveRequest.startDate
      }
    });

    await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { relieverId: reliever.id }
    });

    revalidatePath('/relievers');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Tenaga Pengganti</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Daftar TAD yang cuti dan membutuhkan tenaga pengganti.</p>
      </div>

      <div className="space-y-4">
        {approvedLeaves.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/40 p-10 rounded-3xl border border-slate-200 text-center">
            <p className="text-slate-500">Belum ada pengajuan cuti yang disetujui AM.</p>
          </div>
        ) : (
          approvedLeaves.map((leave) => (
            <div key={leave.id} className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{leave.employee.fullName}</h3>
                  <p className="text-sm text-slate-500">
                    {leave.employee.employeeNumber} - {leave.employee.branchCode} | Cuti: {leave.startDate.toLocaleDateString('id-ID')} s/d {leave.endDate.toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  leave.relieverAssignment ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {leave.relieverAssignment ? 'Pengganti Sudah Ada' : 'Butuh Pengganti'}
                </span>
              </div>

              {/* Jika Belum Ada Reliever, Tampilkan Form */}
              {!leave.relieverAssignment && (
                <form action={assignReliever} className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-700">
                  <input type="hidden" name="leaveRequestId" value={leave.id} />
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3">Input Data Tenaga Pengganti</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input name="fullName" placeholder="Nama Lengkap" required className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                    <input name="phoneNumber" placeholder="No. HP" required className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                    <input name="email" type="email" placeholder="Email (Untuk Absen)" required className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                    <input name="ktpNumber" placeholder="No. KTP" className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 text-sm">
                    Simpan Data Pengganti
                  </button>
                </form>
              )}

                                          {leave.relieverAssignment && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-700 mt-4">
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Tenaga Pengganti Terdaftar:</p>
                  <div className="text-sm text-emerald-800 dark:text-emerald-200 mt-2 space-y-1">
                    <p><strong>Nama:</strong> {leave.relieverAssignment.reliever.fullName}</p>
                    <p><strong>Email:</strong> {leave.relieverAssignment.reliever.email}</p>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3 italic">
                    * Link absensi akan dikirim ke email pengganti setelah cuti disetujui oleh HC.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}