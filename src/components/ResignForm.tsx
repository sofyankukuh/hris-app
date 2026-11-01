    // src/components/ResignForm.tsx
"use client";

import { useState } from 'react';
import { submitResignation } from '@/app/(dashboard)/resign/actions';

export default function ResignForm() {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const file = formData.get('attachment') as File | null;

    // Validasi ukuran file (1MB = 1048576 bytes)
    if (file && file.size > 1048576) {
      setError('Ukuran file surat resign maksimal 1MB. Silakan kompres file Anda.');
      return;
    }

    setIsSubmitting(true);
    // Panggil Server Action
    submitResignation(formData)
      .then(() => {
        // Reset form & refresh
        (e.target as HTMLFormElement).reset();
        window.location.reload();
      })
      .catch((err) => {
        setError(err.message || 'Gagal mengirim pengajuan.');
        setIsSubmitting(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Tanggal Terakhir Bekerja</label>
        <input name="resignDate" type="date" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
      </div>
      
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Alasan</label>
        <textarea name="reason" rows={3} required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"></textarea>
      </div>
      
      <div>
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">Surat Resign (PDF/Gambar) - Maks 1MB</label>
        <input 
          name="attachment" 
          type="file" 
          accept=".pdf, image/*" 
          required
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-md disabled:opacity-50"
      >
        {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Resign'}
      </button>
    </form>
  );
}