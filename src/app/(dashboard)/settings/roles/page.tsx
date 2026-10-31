// src/app/(dashboard)/settings/roles/page.tsx
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function RolesPage() {
  // Ambil data karyawan beserta kategori role & akses mereka
  const employees = await prisma.employee.findMany({
    include: {
      role: true,
      permissions: true,
    },
    orderBy: { fullName: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hak Akses Karyawan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Atur fitur yang bisa diakses oleh masing-masing karyawan secara bebas.</p>
      </div>

      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="p-5 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Karyawan</th>
              <th className="p-5 text-sm font-bold text-slate-600 dark:text-slate-300">Kategori</th>
              <th className="p-5 text-sm font-bold text-slate-600 dark:text-slate-300">Total Akses</th>
              <th className="p-5 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{emp.fullName}</p>
                  <p className="text-xs text-slate-500">{emp.email}</p>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-700">
                    {emp.role?.name || 'Belum ada kategori'}
                  </span>
                </td>
                <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {emp.permissions.length} Fitur
                </td>
                <td className="p-5 text-right">
                  <Link 
                    href={`/settings/roles/${emp.id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
                  >
                    Atur Akses
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}