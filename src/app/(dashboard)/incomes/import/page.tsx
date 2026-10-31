// src/app/(dashboard)/incomes/import/page.tsx
"use client";

import { useState } from 'react';
import { importIncomes } from './actions';
import Link from 'next/link';
import DownloadTemplateIncome from '@/components/DownloadTemplateIncome';

export default function ImportIncomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: number, fail: number } | null>(null);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await importIncomes(formData);
      setResult({ success: res.successCount, fail: res.failCount });
    } catch (err) {
      alert("Gagal memproses file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Import Pendapatan Tambahan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Unggah file Excel untuk Lembur, SPD, atau OPD.</p>
        </div>
        <Link href="/incomes" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
        
        <div className="mb-6 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-700/50">
          <div>
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Gunakan template agar format sesuai.</p>
          </div>
          <DownloadTemplateIncome />
        </div>

        {result && (
          <div className={`mb-6 p-4 rounded-xl border ${result.fail > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <p className="font-bold">Import Selesai!</p>
            <p className="text-sm">Berhasil: {result.success} data. Gagal: {result.fail} data.</p>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih File Excel (.xlsx)</label>
            <input 
              name="file" 
              type="file" 
              accept=".xlsx, .xls" 
              required 
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
            {isLoading ? 'Memproses...' : 'Mulai Import'}
          </button>
        </form>
      </div>
    </div>
  );
}