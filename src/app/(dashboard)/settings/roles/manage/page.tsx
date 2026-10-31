// src/app/(dashboard)/settings/roles/manage/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export default async function ManageRolesPage() {
  const roles = await prisma.role.findMany({
    include: { _count: { select: { employees: true } } },
    orderBy: { name: 'asc' }
  });

  // Tambah Role
  async function addRole(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) return;

    await prisma.role.create({
      data: { name: name.toUpperCase(), description }
    });

    revalidatePath('/settings/roles/manage');
  }

  // Hapus Role
  async function deleteRole(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await prisma.role.delete({ where: { id } });
    revalidatePath('/settings/roles/manage');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kelola Kategori</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tambah atau hapus kategori jabatan (Role).</p>
        </div>
        <Link href="/settings/roles" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Tambah */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 h-fit">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Tambah Kategori Baru</h2>
          <form action={addRole} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Nama Kategori</label>
              <input name="name" required placeholder="Misal: SUPERVISOR" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Deskripsi</label>
              <input name="description" placeholder="Penjelasan singkat..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm">
              Simpan Kategori
            </button>
          </form>
        </div>

        {/* Tabel Daftar */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Nama Kategori</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Karyawan</th>
                  <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{role.name}</p>
                      <p className="text-xs text-slate-500">{role.description || '-'}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{role._count.employees} Orang</td>
                    <td className="p-4 text-right">
                      <form action={deleteRole}>
                        <input type="hidden" name="id" value={role.id} />
                        <button type="submit" className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100" disabled={role._count.employees > 0} title={role._count.employees > 0 ? "Tidak bisa hapus, masih ada karyawan" : "Hapus"}>
                          Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}