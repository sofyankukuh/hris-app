// src/app/employees/edit/[id]/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

  export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Await params terlebih dahulu (aturan baru Next.js 15+)
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  // 2. Ambil data karyawan berdasarkan ID yang sudah didapat
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  // Jika karyawan tidak ditemukan
  if (!employee) {
    return (
      <div className="p-10 text-center text-slate-500">
        <h1 className="text-2xl font-bold mb-4">Karyawan tidak ditemukan</h1>
        <Link href="/employees" className="text-indigo-500 hover:underline">Kembali ke Daftar</Link>
      </div>
    );
  }

  // Server Action untuk menyimpan perubahan (Update)
  async function updateEmployee(formData: FormData) {
    'use server';
    
    const fullName = formData.get('fullName') as string;
    const employeeNumber = formData.get('employeeNumber') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const position = formData.get('position') as string;
    const status = formData.get('status') as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

    // Update ke database
    await prisma.employee.update({
      where: { id: employeeId }, // <-- Ubah params.id menjadi employeeId
      data: { fullName, employeeNumber, email, department, position, status },
    });

    // Segarkan halaman daftar karyawan & alihkan ke halaman daftar
    revalidatePath('/employees');
    redirect('/employees');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Edit Karyawan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Perbarui data untuk {employee.fullName}.</p>
        </div>
        <Link href="/employees" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          Batal
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-4xl border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
        <form action={updateEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
            <input name="fullName" type="text" defaultValue={employee.fullName} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">NIK</label>
            <input name="employeeNumber" type="text" defaultValue={employee.employeeNumber} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input name="email" type="email" defaultValue={employee.email} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Departemen</label>
            <input name="department" type="text" defaultValue={employee.department} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jabatan</label>
            <input name="position" type="text" defaultValue={employee.position} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
            <select name="status" defaultValue={employee.status} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm appearance-none">
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
              <option value="ON_LEAVE">Cuti</option>
            </select>
          </div>
          
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full px-6 py-3.5 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-sm active:scale-[0.98]">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}