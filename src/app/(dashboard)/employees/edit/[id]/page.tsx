// src/app/employees/edit/[id]/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    return (
      <div className="p-10 text-center text-slate-500">
        <h1 className="text-2xl font-bold mb-4">Karyawan tidak ditemukan</h1>
        <Link href="/employees" className="text-indigo-500 hover:underline">Kembali ke Daftar</Link>
      </div>
    );
  }

  async function updateEmployee(formData: FormData) {
    'use server';
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const position = formData.get('position') as string;
    
    const phoneNumber = formData.get('phoneNumber') as string || null;
    const gender = formData.get('gender') as string || null;
    const religion = formData.get('religion') as string || null;
    const birthPlace = formData.get('birthPlace') as string || null;
    const address = formData.get('address') as string || null;
    const education = formData.get('education') as string || null;
    const bankName = formData.get('bankName') as string || null;
    const bankAccount = formData.get('bankAccount') as string || null;
    const status = formData.get('status') as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
    
    // Data Baru
    const customer = formData.get('customer') as string || null;
    const branchCode = formData.get('branchCode') as string || null;
    const outlet = formData.get('outlet') as string || null;
    const maritalStatus = formData.get('maritalStatus') as string || null;
    const motherName = formData.get('motherName') as string || null;
    const spouseName = formData.get('spouseName') as string || null;
    const ktpNumber = formData.get('ktpNumber') as string || null;
    const npwpNumber = formData.get('npwpNumber') as string || null;
    const jamsostekNumber = formData.get('jamsostekNumber') as string || null;
    const contractNumber = formData.get('contractNumber') as string || null;
    
    const childrenCountStr = formData.get('childrenCount') as string;
    const childrenCount = childrenCountStr ? parseInt(childrenCountStr, 10) : 0;

    // Tanggal-tanggal
    const birthDateStr = formData.get('birthDate') as string;
    const birthDate = birthDateStr ? new Date(birthDateStr) : null;
    
    const joinDateStr = formData.get('joinDate') as string;
    const joinDate = joinDateStr ? new Date(joinDateStr) : employee!.joinDate;

    const contractStartStr = formData.get('contractStart') as string;
    const contractStart = contractStartStr ? new Date(contractStartStr) : null;

    const contractEndStr = formData.get('contractEnd') as string;
    const contractEnd = contractEndStr ? new Date(contractEndStr) : null;

    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        fullName, email, department, position,
        phoneNumber, gender, religion, birthPlace, birthDate,
        address, education, bankName, bankAccount, joinDate, status,
        customer, branchCode, outlet, maritalStatus, motherName, spouseName,
        ktpNumber, npwpNumber, jamsostekNumber, contractNumber, childrenCount,
        contractStart, contractEnd,
      },
    });

    revalidatePath('/employees');
    redirect('/employees');
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Edit Karyawan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Perbarui data untuk {employee.fullName}.</p>
        </div>
        <Link href="/employees" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Batal
        </Link>
      </div>

      <form action={updateEmployee} className="space-y-6">
        {/* BAGIAN 1: DATA UTAMA & PENEMPATAN */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">1. Data Utama & Penempatan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">NIK (Tidak bisa diubah)</label>
              <input name="employeeNumber" type="text" defaultValue={employee.employeeNumber} readOnly className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <input name="fullName" type="text" defaultValue={employee.fullName} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input name="email" type="email" defaultValue={employee.email} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Departemen</label>
              <input name="department" type="text" defaultValue={employee.department} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jabatan</label>
              <input name="position" type="text" defaultValue={employee.position} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Customer</label>
              <input name="customer" type="text" defaultValue={employee.customer || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">K. Cabang</label>
                <input name="branchCode" type="text" defaultValue={employee.branchCode || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Outlet</label>
                <input name="outlet" type="text" defaultValue={employee.outlet || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tanggal Masuk</label>
              <input name="joinDate" type="date" defaultValue={employee.joinDate.toISOString().split('T')[0]} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Pendidikan</label>
              <input name="education" type="text" defaultValue={employee.education || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Status Karyawan</label>
              <select name="status" defaultValue={employee.status} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none">
                <option value="ACTIVE">Aktif (Bekerja)</option>
                <option value="INACTIVE">Tidak Aktif (Resign / PHK)</option>
                <option value="ON_LEAVE">Cuti (Sementara)</option>
              </select>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: DATA PRIBADI & KELUARGA */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">2. Data Pribadi & Keluarga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. HP</label>
              <input name="phoneNumber" type="text" defaultValue={employee.phoneNumber || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jenis Kelamin</label>
              <select name="gender" defaultValue={employee.gender || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none">
                <option value="">Pilih...</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tempat Lahir</label>
              <input name="birthPlace" type="text" defaultValue={employee.birthPlace || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tanggal Lahir</label>
              <input name="birthDate" type="date" defaultValue={employee.birthDate ? employee.birthDate.toISOString().split('T')[0] : ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Agama</label>
              <input name="religion" type="text" defaultValue={employee.religion || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Rumusan Pajak</label>
              <input name="maritalStatus" type="text" defaultValue={employee.maritalStatus || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Ibu Kandung</label>
              <input name="motherName" type="text" defaultValue={employee.motherName || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Istri/Suami</label>
              <input name="spouseName" type="text" defaultValue={employee.spouseName || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jumlah Anak</label>
              <input name="childrenCount" type="number" defaultValue={employee.childrenCount || 0} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Alamat Lengkap</label>
              <textarea name="address" rows={2} defaultValue={employee.address || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"></textarea>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: IDENTITAS & KONTRAK */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">3. Identitas & Kontrak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. KTP</label>
              <input name="ktpNumber" type="text" defaultValue={employee.ktpNumber || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. NPWP</label>
              <input name="npwpNumber" type="text" defaultValue={employee.npwpNumber || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. Jamsostek / BPJS</label>
              <input name="jamsostekNumber" type="text" defaultValue={employee.jamsostekNumber || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. Kontrak</label>
              <input name="contractNumber" type="text" defaultValue={employee.contractNumber || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Mulai Kontrak</label>
              <input name="contractStart" type="date" defaultValue={employee.contractStart ? employee.contractStart.toISOString().split('T')[0] : ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Selesai Kontrak</label>
              <input name="contractEnd" type="date" defaultValue={employee.contractEnd ? employee.contractEnd.toISOString().split('T')[0] : ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
          </div>
        </div>

        {/* BAGIAN 4: FINANSIAL */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">4. Data Finansial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Bank</label>
              <input name="bankName" type="text" defaultValue={employee.bankName || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. Rekening</label>
              <input name="bankAccount" type="text" defaultValue={employee.bankAccount || ''} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-4 pb-20">
          <button type="submit" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98]">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}