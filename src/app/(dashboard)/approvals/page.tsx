// src/app/(dashboard)/approvals/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { sendRelieverEmail } from '@/lib/mailer';

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // 1. Ambil pengajuan CUTI
  const pendingLeaves = await prisma.approvalStep.findMany({
    where: { approverId: userId, status: 'WAITING' },
    include: { leaveRequest: { include: { employee: true } } },
    orderBy: { leaveRequest: { createdAt: 'desc' } }
  });

  // 2. Ambil pengajuan RESIGN
  const pendingResigns = await prisma.resignationApproval.findMany({
    where: { approverId: userId, status: 'WAITING' },
    include: { resignation: { include: { employee: true } } },
    orderBy: { resignation: { createdAt: 'desc' } }
  });

  // 3. Ambil pengajuan SPD
  const pendingTrips = await prisma.businessTripApproval.findMany({
    where: { approverId: userId, status: 'WAITING' },
    include: { businessTrip: { include: { employee: true } } },
    orderBy: { businessTrip: { createdAt: 'desc' } }
  });

  // --- SERVER ACTION: APPROVE CUTI ---
  async function handleLeaveApproval(formData: FormData) {
    'use server';
    const stepId = formData.get('stepId') as string;
    const action = formData.get('action') as 'APPROVED' | 'REJECTED';
    const notes = formData.get('notes') as string;

    const relieverName = formData.get('relieverName') as string;
    const relieverPhone = formData.get('relieverPhone') as string;
    const relieverEmail = formData.get('relieverEmail') as string;
    const relieverKtp = formData.get('relieverKtp') as string;

    const currentStep = await prisma.approvalStep.findUnique({
      where: { id: stepId },
      include: { leaveRequest: true }
    });

    if (!currentStep) throw new Error("Data tidak ditemukan");

    await prisma.approvalStep.update({
      where: { id: stepId },
      data: { status: action, notes, approvedAt: new Date() }
    });

    if (action === 'REJECTED') {
      await prisma.leaveRequest.update({ where: { id: currentStep.leaveRequestId }, data: { status: 'REJECTED' } });
      revalidatePath('/approvals');
      return;
    }

    if (action === 'APPROVED' && currentStep.role === 'AM') {
      if (relieverName && relieverName.trim() !== '') {
        const reliever = await prisma.reliever.create({
          data: { tenantId: currentStep.leaveRequest.tenantId, fullName: relieverName, phoneNumber: relieverPhone || null, email: relieverEmail || null, ktpNumber: relieverKtp || null }
        });
        await prisma.relieverAssignment.create({
          data: { tenantId: currentStep.leaveRequest.tenantId, leaveRequestId: currentStep.leaveRequestId, relieverId: reliever.id, date: currentStep.leaveRequest.startDate }
        });
        await prisma.leaveRequest.update({ where: { id: currentStep.leaveRequestId }, data: { relieverId: reliever.id } });
      }
      const hc = await prisma.employee.findFirst({ where: { role: { name: 'HC' }, tenantId: currentStep.leaveRequest.tenantId } });
      if (hc) {
        await prisma.approvalStep.create({
          data: { leaveRequestId: currentStep.leaveRequestId, approverId: hc.id, role: 'HC', status: 'WAITING' }
        });
      }
    } else if (action === 'APPROVED' && currentStep.role === 'HC') {
      await prisma.leaveRequest.update({ where: { id: currentStep.leaveRequestId }, data: { status: 'APPROVED' } });
      
      const assignment = await prisma.relieverAssignment.findUnique({
        where: { leaveRequestId: currentStep.leaveRequestId },
        include: { reliever: true, leaveRequest: { include: { employee: true } } }
      });
      if (assignment && assignment.reliever.email) {
        const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reliever-absen/${assignment.uniqueToken}`;
        try {
          await sendRelieverEmail(assignment.reliever.email, assignment.reliever.fullName, assignment.leaveRequest.employee.fullName, assignment.date, link);
        } catch (error) { console.error(error); }
      }
    }
    revalidatePath('/approvals');
  }

  // --- SERVER ACTION: APPROVE RESIGN ---
  async function handleResignApproval(formData: FormData) {
    'use server';
    const stepId = formData.get('stepId') as string;
    const action = formData.get('action') as 'APPROVED' | 'REJECTED';
    const notes = formData.get('notes') as string;

    const currentStep = await prisma.resignationApproval.findUnique({
      where: { id: stepId },
      include: { resignation: true }
    });

    if (!currentStep) throw new Error("Data tidak ditemukan");

    await prisma.resignationApproval.update({
      where: { id: stepId },
      data: { status: action, notes, approvedAt: new Date() }
    });

    if (action === 'REJECTED') {
      await prisma.resignation.update({ where: { id: currentStep.resignationId }, data: { status: 'REJECTED' } });
    } else if (action === 'APPROVED') {
      if (currentStep.role === 'AM') {
        const hc = await prisma.employee.findFirst({ where: { role: { name: 'HC' }, tenantId: currentStep.resignation.tenantId } });
        if (hc) {
          await prisma.resignationApproval.create({
            data: { resignationId: currentStep.resignationId, approverId: hc.id, role: 'HC', status: 'WAITING' }
          });
        }
      } else if (currentStep.role === 'HC') {
        await prisma.resignation.update({ where: { id: currentStep.resignationId }, data: { status: 'APPROVED' } });
        await prisma.employee.update({ 
          where: { id: currentStep.resignation.employeeId }, 
          data: { status: 'INACTIVE', exitDate: currentStep.resignation.resignDate } 
        });
      }
    }
    revalidatePath('/approvals');
  }

  // --- SERVER ACTION: APPROVE SPD ---
  async function handleTripApproval(formData: FormData) {
    'use server';
    const stepId = formData.get('stepId') as string;
    const action = formData.get('action') as 'APPROVED' | 'REJECTED';
    const notes = formData.get('notes') as string;

    const currentStep = await prisma.businessTripApproval.findUnique({
      where: { id: stepId },
      include: { businessTrip: true }
    });

    if (!currentStep) throw new Error("Data tidak ditemukan");

    await prisma.businessTripApproval.update({
      where: { id: stepId },
      data: { status: action, notes, approvedAt: new Date() }
    });

    if (action === 'REJECTED') {
      await prisma.businessTrip.update({ where: { id: currentStep.businessTripId }, data: { status: 'REJECTED' } });
    } else if (action === 'APPROVED') {
      if (currentStep.role === 'AM') {
        const hc = await prisma.employee.findFirst({ where: { role: { name: 'HC' }, tenantId: currentStep.businessTrip.tenantId } });
        if (hc) {
          await prisma.businessTripApproval.create({
            data: { businessTripId: currentStep.businessTripId, approverId: hc.id, role: 'HC', status: 'WAITING' }
          });
        }
      } else if (currentStep.role === 'HC') {
        await prisma.businessTrip.update({ where: { id: currentStep.businessTripId }, data: { status: 'APPROVED' } });
      }
    }
    revalidatePath('/approvals');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Persetujuan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Daftar pengajuan yang menunggu persetujuan Anda.</p>
      </div>

      <div className="space-y-8">
        
        {/* PERSETUJUAN RESIGN */}
        {pendingResigns.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><span className="text-xl">📄</span> Pengajuan Resign</h2>
            <div className="space-y-4">
              {pendingResigns.map((step) => (
                <div key={step.id} className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{step.resignation.employee.fullName}</h3>
                      <p className="text-sm text-slate-500">{step.resignation.employee.employeeNumber} - {step.resignation.employee.branchCode}</p>
                    </div>
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg">Resign</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-500">Tanggal Terakhir</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{step.resignation.resignDate.toLocaleDateString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Alasan</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{step.resignation.reason || '-'}</p>
                    </div>
                    {step.resignation.attachmentUrl && (
                      <div className="col-span-2">
                        <a href={step.resignation.attachmentUrl} target="_blank" className="text-indigo-500 text-xs hover:underline">📎 Lihat Surat Resign</a>
                      </div>
                    )}
                  </div>
                  <form action={handleResignApproval} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input type="hidden" name="stepId" value={step.id} />
                    <input name="notes" placeholder="Catatan (opsional)" className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full" />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button type="submit" name="action" value="APPROVED" className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600">Setujui</button>
                      <button type="submit" name="action" value="REJECTED" className="flex-1 sm:flex-none px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-lg hover:bg-rose-600">Tolak</button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERSETUJUAN SPD */}
        {pendingTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><span className="text-xl">✈️</span> Pengajuan Surat Tugas (SPD)</h2>
            <div className="space-y-4">
              {pendingTrips.map((step) => (
                <div key={step.id} className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-sky-200 dark:border-sky-900/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{step.businessTrip.employee.fullName}</h3>
                      <p className="text-sm text-slate-500">{step.businessTrip.employee.employeeNumber}</p>
                    </div>
                    <span className="px-3 py-1 bg-sky-50 text-sky-600 text-xs font-bold rounded-lg">SPD</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-500">Tujuan</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{step.businessTrip.destination}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Tanggal</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{step.businessTrip.startDate.toLocaleDateString('id-ID')} s/d {step.businessTrip.endDate.toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500">Keperluan</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{step.businessTrip.purpose}</p>
                    </div>
                  </div>
                  <form action={handleTripApproval} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input type="hidden" name="stepId" value={step.id} />
                    <input name="notes" placeholder="Catatan (opsional)" className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full" />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button type="submit" name="action" value="APPROVED" className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600">Setujui</button>
                      <button type="submit" name="action" value="REJECTED" className="flex-1 sm:flex-none px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-lg hover:bg-rose-600">Tolak</button>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERSETUJUAN CUTI */}
        {pendingLeaves.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><span className="text-xl">🌴</span> Pengajuan Cuti & Izin</h2>
            <div className="space-y-4">
              {pendingLeaves.map((step) => (
                <div key={step.id} className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{step.leaveRequest.employee.fullName}</h3>
                      <p className="text-sm text-slate-500">{step.leaveRequest.employee.employeeNumber} - {step.leaveRequest.employee.branchCode}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg">{step.leaveRequest.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-500">Tanggal</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{step.leaveRequest.startDate.toLocaleDateString('id-ID')} s/d {step.leaveRequest.endDate.toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-500">Alasan</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{step.leaveRequest.reason || '-'}</p>
                      {step.leaveRequest.attachmentUrl && (
                        <a href={step.leaveRequest.attachmentUrl} target="_blank" className="text-indigo-500 text-xs hover:underline mt-1 inline-block">📎 Lihat Lampiran</a>
                      )}
                    </div>
                  </div>
                  <form action={handleLeaveApproval} className="flex flex-col gap-3">
                    <input type="hidden" name="stepId" value={step.id} />
                    {userRole === 'AM' && step.role === 'AM' && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-700 mb-2">
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3">Data Tenaga Pengganti (Wajib diisi AM)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input name="relieverName" placeholder="Nama Lengkap Pengganti" required className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                          <input name="relieverPhone" placeholder="No. HP Pengganti" required className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                          <input name="relieverEmail" type="email" placeholder="Email Pengganti (Untuk Absen)" required className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                          <input name="relieverKtp" placeholder="No. KTP Pengganti" className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <input name="notes" placeholder="Catatan (opsional)" className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full" />
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button type="submit" name="action" value="APPROVED" className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600">Setujui</button>
                        <button type="submit" name="action" value="REJECTED" className="flex-1 sm:flex-none px-4 py-2 bg-rose-500 text-white text-sm font-bold rounded-lg hover:bg-rose-600">Tolak</button>
                      </div>
                    </div>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KOSONG */}
        {pendingLeaves.length === 0 && pendingResigns.length === 0 && pendingTrips.length === 0 && (
          <div className="bg-white dark:bg-slate-800/40 p-10 rounded-3xl border border-slate-200 text-center">
            <p className="text-slate-500">Tidak ada pengajuan yang menunggu persetujuan.</p>
          </div>
        )}

      </div>
    </div>
  );
}