// src/app/(dashboard)/settings/access/page.tsx
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

export default async function AccessManagementPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string, branchCode?: string }> 
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  const tenantId = (session.user as any).tenantId;
  
  const params = await searchParams;
  const query = params.query || '';
  const branchCode = params.branchCode || '';

  // 1. Ambil daftar cabang unik
  const branches = await prisma.employee.findMany({
    where: { tenantId, branchCode: { not: null } },
    select: { branchCode: true },
    distinct: ['branchCode'],
    orderBy: { branchCode: 'asc' }
  });

  // 2. Ambil daftar role
  const roles = await prisma.role.findMany();

  // 3. Ambil data karyawan
  const employees = await prisma.employee.findMany({
    where: {
      tenantId,
      AND: [
        query ? {
          OR: [
            { fullName: { contains: query, mode: 'insensitive' } },
            { employeeNumber: { contains: query, mode: 'insensitive' } },
          ]
        } : {},
        branchCode ? { branchCode: branchCode } : {},
      ]
    },
    include: { role: true },
    orderBy: { fullName: 'asc' },
    take: 50
  });

  // Server Action Simpan
  async function updateUserAccess(formData: FormData) {
    'use server';
    const employeeId = formData.get('employeeId') as string;
    const roleId = formData.get('roleId') as string;
    const password = formData.get('password') as string;

    const dataToUpdate: any = {
      roleId: roleId === '' ? null : roleId,
    };

    if (password && password.length > 0) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    await prisma.employee.update({
      where: { id: employeeId },
      data: dataToUpdate
    });

    revalidatePath('/settings/access');
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Akun & Identitas</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Berikan akses login, atur kategori, dan kelola fitur karyawan.</p>
      </div>

      {/* Filter */}
      <form className="mb-6 flex flex-col sm:flex-row gap-2" action="/settings/access" method="GET">
        <input 
          type="text" 
          name="query" 
          defaultValue={query}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" 
          placeholder="Cari nama atau NIK..." 
        />
        <select 
          name="branchCode" 
          defaultValue={branchCode}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
        >
          <option value="">Semua Cabang</option>
          {branches.map((b) => (
            <option key={b.branchCode} value={b.branchCode!}>{b.branchCode}</option>
          ))}
        </select>
        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
          Filter
        </button>
      </form>

      {/* Tabel */}
      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Karyawan</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">NIK</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Cabang</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Kategori</th>
                <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Atur Akses & Fitur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{emp.fullName}</td>
                  <td className="p-4 text-sm text-slate-600">{emp.employeeNumber}</td>
                  <td className="p-4 text-sm text-slate-600">{emp.branchCode || '-'}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                      {emp.role?.name || 'Belum Ada'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {/* Form Ubah Role & Password */}
                      <form action={updateUserAccess} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <input type="hidden" name="employeeId" value={emp.id} />
                        <select name="roleId" defaultValue={emp.roleId || ''} className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                          <option value="">Hapus Akses</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        <input 
                          name="password" 
                          type="password" 
                          placeholder="Password Baru" 
                          className="px-2 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs w-32" 
                        />
                        <button type="submit" className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900">Simpan</button>
                      </form>

                      {/* Tombol Atur Fitur (Mengarah ke halaman [id]) */}
                      <Link 
                        href={`/settings/roles/${emp.id}`}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 border border-indigo-200"
                      >
                        Atur Fitur
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}