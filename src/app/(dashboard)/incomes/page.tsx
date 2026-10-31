// src/app/(dashboard)/incomes/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IncomesPage() {
  const router = useRouter();
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/incomes')
      .then(res => res.json())
      .then(data => {
        setIncomes(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  if (isLoading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pendapatan Tambahan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Daftar Lembur, SPD, dan OPD Anda.</p>
        </div>
        
        {/* Tombol Pakai Router.push */}
        <button 
          onClick={() => router.push('/incomes/import')}
          className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
        >
          📥 Import Excel
        </button>
      </div>

      {/* Tabel Pendapatan */}
      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Tanggal</th>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Jenis</th>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300">Keterangan</th>
              <th className="p-4 text-sm font-bold text-slate-600 dark:text-slate-300 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {incomes.map((income) => (
              <tr key={income.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {new Date(income.date).toLocaleDateString('id-ID')}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    income.type === 'LEMBUR' ? 'bg-amber-50 text-amber-600' :
                    income.type === 'SPD' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {income.type}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                  {income.description || '-'}
                </td>
                <td className="p-4 text-sm font-bold text-slate-800 dark:text-slate-100 text-right">
                  {formatRupiah(income.amount)}
                </td>
              </tr>
            ))}
            {incomes.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada data pendapatan tambahan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}