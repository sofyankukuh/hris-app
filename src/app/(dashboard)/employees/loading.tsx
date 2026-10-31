// src/app/(dashboard)/employees/loading.tsx
export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">Memuat data karyawan...</p>
    </div>
  );
}