// src/app/employees/create/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewEmployeePage() {
  async function addEmployee(formData: FormData) {
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

    const birthDateStr = formData.get('birthDate') as string;
    const birthDate = birthDateStr ? new Date(birthDateStr) : null;
    
    const joinDateStr = formData.get('joinDate') as string;
    const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();

    const contractStartStr = formData.get('contractStart') as string;
    const contractStart = contractStartStr ? new Date(contractStartStr) : null;

    const contractEndStr = formData.get('contractEnd') as string;
    const contractEnd = contractEndStr ? new Date(contractEndStr) : null;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error('Tenant tidak ditemukan');

    const prefix = tenant.employeePrefix;
    const existingEmployees = await prisma.employee.findMany({
      where: { tenantId: tenant.id, employeeNumber: { startsWith: prefix } },
      select: { employeeNumber: true }
    });
    let maxNumber = 0;
    existingEmployees.forEach((emp) => {
      const parsed = parseInt(emp.employeeNumber.replace(prefix, ""), 10);
      if (!isNaN(parsed) && parsed > maxNumber) maxNumber = parsed;
    });
    const newEmployeeNumber = `${prefix}${(maxNumber + 1).toString().padStart(3, '0')}`;

    await prisma.employee.create({
      data: {
        tenantId: tenant.id,
        employeeNumber: newEmployeeNumber,
        fullName, email, department, position,
        phoneNumber, gender, religion, birthPlace, birthDate,
        address, education, bankName, bankAccount, joinDate,
        customer, branchCode, outlet, maritalStatus, motherName, spouseName,
        ktpNumber, npwpNumber, jamsostekNumber, contractNumber, childrenCount,
        contractStart, contractEnd,
        status: 'ACTIVE',
      }
    });

    revalidatePath('/employees');
    redirect('/employees');
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tambah Karyawan Baru</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Lengkapi data profil karyawan di bawah ini.</p>
        </div>
        <Link href="/employees" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <form action={addEmployee} className="space-y-6">
        {/* BAGIAN 1: DATA UTAMA & PENEMPATAN */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">1. Data Utama & Penempatan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
              <input name="fullName" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Sesuai KTP" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input name="email" type="email" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="email@perusahaan.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Departemen</label>
              <input name="department" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="IT, HR, Finance" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jabatan</label>
              <input name="position" type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Staff, Manager" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Customer</label>
              <input name="customer" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="PRODUCT & SERVICE" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">K. Cabang</label>
                <input name="branchCode" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="BR01" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Outlet</label>
                <input name="outlet" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="PUSAT" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tanggal Masuk</label>
              <input name="joinDate" type="date" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Pendidikan</label>
              <input name="education" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="S1, SMA, D3" />
            </div>
          </div>
        </div>

        {/* BAGIAN 2: DATA PRIBADI & KELUARGA */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">2. Data Pribadi & Keluarga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. HP</label>
              <input name="phoneNumber" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="08123456789" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jenis Kelamin</label>
              <select name="gender" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none">
                <option value="">Pilih...</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tempat Lahir</label>
              <input name="birthPlace" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Jakarta" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tanggal Lahir</label>
              <input name="birthDate" type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Agama</label>
              <input name="religion" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Islam, Kristen, dll" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Rumusan Pajak</label>
              <input name="maritalStatus" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="TK/0, K/1, dll" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Ibu Kandung</label>
              <input name="motherName" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Nama Ibu" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Istri/Suami</label>
              <input name="spouseName" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Nama Pasangan" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jumlah Anak</label>
              <input name="childrenCount" type="number" defaultValue="0" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Alamat Lengkap</label>
              <textarea name="address" rows={2} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="Jl. Contoh No. 123..."></textarea>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: IDENTITAS & KONTRAK */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">3. Identitas & Kontrak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. KTP</label>
              <input name="ktpNumber" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="317501..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. NPWP</label>
              <input name="npwpNumber" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="04648..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. Jamsostek / BPJS</label>
              <input name="jamsostekNumber" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="25062..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. Kontrak</label>
              <input name="contractNumber" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="A.40063.01/..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Mulai Kontrak</label>
              <input name="contractStart" type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Selesai Kontrak</label>
              <input name="contractEnd" type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" />
            </div>
          </div>
        </div>

        {/* BAGIAN 4: FINANSIAL */}
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-indigo-500 mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">4. Data Finansial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nama Bank</label>
              <input name="bankName" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="BCA, Mandiri, BNI" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">No. Rekening</label>
              <input name="bankAccount" type="text" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" placeholder="1234567890" />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-4 pb-20">
          <button type="submit" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98]">
            Simpan Data Karyawan
          </button>
        </div>
      </form>
    </div>
  );
}