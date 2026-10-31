// src/app/(dashboard)/settings/roles/[id]/page.tsx
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EmployeeAccessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const employeeId = resolvedParams.id;

  // Ambil data karyawan beserta akses yang sudah dimiliki
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      role: true,
      permissions: true,
    }
  });

  if (!employee) return <div>Karyawan tidak ditemukan</div>;

  // Ambil semua fitur yang ada di sistem
  const allPermissions = await prisma.permission.findMany({
    orderBy: { name: 'asc' }
  });

  // Server Action untuk menyimpan centang
  async function updatePermissions(formData: FormData) {
    'use server';
    
    const selectedPermissionIds = formData.getAll('permissions') as string[];

    // 1. Putuskan semua akses lama karyawan ini
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        permissions: {
          set: [] // Kosongkan dulu
        }
      }
    });

    // 2. Hubungkan akses yang baru dicentang
    if (selectedPermissionIds.length > 0) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          permissions: {
            connect: selectedPermissionIds.map(id => ({ id }))
          }
        }
      });
    }

    revalidatePath(`/settings/roles/${employeeId}`);
    revalidatePath('/settings/roles');
    redirect('/settings/roles');
  }

  const activePermissionIds = employee.permissions.map(p => p.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hak Akses: {employee.fullName}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kategori: {employee.role?.name || 'Tidak ada'}</p>
        </div>
        <Link href="/settings/roles" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <form action={updatePermissions} className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
        
        <div className="space-y-4 mb-8">
          {allPermissions.map((perm) => (
            <label key={perm.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                name="permissions" 
                value={perm.id}
                defaultChecked={activePermissionIds.includes(perm.id)}
                className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{perm.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{perm.description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
          <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}