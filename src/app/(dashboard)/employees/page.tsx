// src/app/employees/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';

export default async function EmployeesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ query?: string, page?: string, success?: string, skip?: string, update?: string, invalid?: string }> 
}) {
  const params = await searchParams;
  const query = params.query || '';
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 10; // Batasan tampilan agar ringan

  // 1. LOGIKA PENCARIAN MULTI-KOLOM (Nama, NIK, Cabang, Outlet, KTP, No HP)
  const whereClause = {
    OR: [
      { fullName: { contains: query, mode: 'insensitive' as const } },
      { employeeNumber: { contains: query, mode: 'insensitive' as const } },
      { branchCode: { contains: query, mode: 'insensitive' as const } },
      { outlet: { contains: query, mode: 'insensitive' as const } },
      { ktpNumber: { contains: query, mode: 'insensitive' as const } },
      { phoneNumber: { contains: query, mode: 'insensitive' as const } },
    ]
  };

  // Hitung total data untuk pagination
  const totalEmployees = await prisma.employee.count({ where: query ? whereClause : {} });
  
  // Ambil data (Terbaru di atas, dibatasi 10 per halaman)
  const employees = await prisma.employee.findMany({
    where: query ? whereClause : {},
    orderBy: { createdAt: 'desc' }, // Urutkan dari yang terbaru
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  });

  const totalPages = Math.ceil(totalEmployees / itemsPerPage);

  async function removeEmployee(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    try {
      await prisma.employee.delete({ where: { id } });
    } catch (error) {
      console.error("Gagal menghapus:", error);
    }
    revalidatePath('/employees');
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300',
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
      'bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300',
      'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300',
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Notifikasi Import */}
      {params.success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-bold">Import Selesai!</p>
            <p className="text-sm">
              Masuk: {params.success} data. 
              {params.update !== '0' && ` Diperbarui: ${params.update} data.`}
              {params.skip !== '0' && ` Dilewati: ${params.skip} data.`}
              {params.invalid !== '0' && ` Gagal: ${params.invalid} data.`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Data Karyawan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Total {totalEmployees} orang terdaftar</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/employees/import" className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <span className="text-base">📥</span> Import
          </Link>
          <Link href="/employees/create" className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] flex items-center gap-2">
            <span className="text-base">+</span> Tambah
          </Link>
        </div>
      </div>

      {/* FITUR PENCARIAN */}
      <form className="mb-6 flex gap-2" action="/employees" method="GET">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="text" 
            name="query" 
            defaultValue={query}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm" 
            placeholder="Cari Nama, NIK, Cabang, KTP, No HP..." 
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors text-sm">
          Cari
        </button>
      </form>

            {/* Daftar Karyawan */}
      <div className="flex flex-col gap-3">
        {employees.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
            <div className="text-5xl mb-4 opacity-50">👥</div>
            <p className="font-semibold text-lg">Tidak ada data ditemukan</p>
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.id} className="bg-white dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-all group gap-4">
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${getAvatarColor(emp.fullName)}`}>
                  {getInitials(emp.fullName)}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">{emp.fullName}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-xs">{emp.employeeNumber}</span>
                    <span>{emp.department}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{emp.position}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  emp.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {emp.status === 'ACTIVE' ? 'Aktif' : emp.status}
                </span>

                <div className="flex items-center gap-1 pl-4 border-l border-slate-100 dark:border-slate-700">
                  <Link href={`/employees/edit/${emp.id}`} className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-xl transition-colors" title="Edit Karyawan">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Link>
                  
                  <DeleteButton formAction={removeEmployee} id={emp.id} />
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* SMART PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 mb-10">
          
          {/* Tombol Sebelumnya */}
          <Link 
            href={`/employees?page=${currentPage - 1}${query ? `&query=${query}` : ''}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${currentPage === 1 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            Sebelumnya
          </Link>

          {/* Nomor Halaman (Cerdas) */}
          <div className="flex items-center gap-1">
            {/* Selalu tampilkan Halaman 1 */}
            <Link href={`/employees?page=1${query ? `&query=${query}` : ''}`} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold border ${currentPage === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>1</Link>
            
            {/* Elipsis (titik-titik) jika halaman aktif jauh dari halaman 1 */}
            {currentPage > 3 && <span className="text-slate-400 px-2">...</span>}

            {/* Tampilkan halaman di sekitar halaman aktif */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page > 1 && page < totalPages && Math.abs(page - currentPage) <= 1)
              .map(page => (
                <Link 
                  key={page} 
                  href={`/employees?page=${page}${query ? `&query=${query}` : ''}`} 
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold border ${currentPage === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  {page}
                </Link>
              ))}

            {/* Elipsis jika halaman aktif jauh dari halaman terakhir */}
            {currentPage < totalPages - 2 && <span className="text-slate-400 px-2">...</span>}

            {/* Selalu tampilkan Halaman Terakhir */}
            {totalPages > 1 && (
              <Link href={`/employees?page=${totalPages}${query ? `&query=${query}` : ''}`} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold border ${currentPage === totalPages ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>{totalPages}</Link>
            )}
          </div>

          {/* Tombol Selanjutnya */}
          <Link 
            href={`/employees?page=${currentPage + 1}${query ? `&query=${query}` : ''}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          >
            Selanjutnya
          </Link>

          {/* FITUR LOMPAT KE HALAMAN */}
          <form action="/employees" method="GET" className="flex items-center gap-2 ml-4 border-l border-slate-200 pl-4">
            {query && <input type="hidden" name="query" value={query} />}
            <span className="text-sm text-slate-500 font-medium">Ke:</span>
            <input 
              type="number" 
              name="page" 
              min="1" 
              max={totalPages}
              defaultValue={currentPage}
              className="w-16 px-2 py-2 text-center bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20" 
            />
            <button type="submit" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">Go</button>
          </form>

        </div>
      )}
    </div>
  );
}