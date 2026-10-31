// src/app/employees/import/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { saveImportedData } from './actions';
import DownloadTemplateButton from '@/components/DownloadTemplateButton';

const parseDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  if (typeof dateStr === 'number') {
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
  }
  const str = String(dateStr).trim();
  const parts = str.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

export default function ImportEmployeePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stagedData, setStagedData] = useState<any[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileRead = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setStagedData([]);
    setIsLoading(true);

    try {
      const bytes = await file.arrayBuffer();
      const workbook = XLSX.read(bytes, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (rawData.length === 0) throw new Error('File Excel kosong.');

      const formattedData = rawData.map((row) => ({
        fullName: row['Nama'] || 'Tanpa Nama',
        email: row['Email'] || null,
        oldNik: row['NIK (BKP-001)'] || row['NIK'] || null, // Support header baru & lama
        ktpNumber: row['No_KTP'] || null,
        phoneNumber: row['no_hp'] || null,
        department: row['Departemen'] || 'Umum',
        position: row['Jabatan'] || 'Staff',
        education: row['Pendidikan'] || null,
        birthDate: parseDate(row['Tgl_Lahir (DD-MM-YYYY)']),
        birthPlace: row['Tempat_Lahir'] || null,
        religion: row['Agama'] || null,
        maritalStatus: row['Rumusan'] || null,
        address: row['Alamat'] || null,
        motherName: row['NamaIbuKandung'] || null,
        spouseName: row['NamaIstri'] || null,
        childrenCount: row['J.Anak'] ? parseInt(row['J.Anak']) : 0,
        jamsostekNumber: row['no_jamsostek'] || null,
        npwpNumber: row['npwp_karyawan'] || null,
        bankName: row['nama_rek_karyawan'] || null,
        bankAccount: row['rekening'] || null,
        joinDate: parseDate(row['tgl_masuk (DD-MM-YYYY)']),
        contractStart: parseDate(row['tgl_mulai_kontrak (DD-MM-YYYY)']),
        contractEnd: parseDate(row['tgl_selesai_kontrak (DD-MM-YYYY)']),
        contractNumber: row['no_kontrak'] || null,
      }));

      setStagedData(formattedData);
      
      const res = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formattedData })
      });
      const checkResult = await res.json();
      setDuplicateCount(checkResult.duplicateCount);

    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca file Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async (action: 'skip' | 'overwrite') => {
    setIsLoading(true);
    try {
      const result = await saveImportedData(stagedData, action);
      if (result.success) {
        router.push(`/employees?success=${result.successCount}&skip=${result.skipCount}&update=${result.updateCount}`);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Import Data Karyawan</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Unggah file, tinjau, lalu konfirmasi.</p>
        </div>
        <Link href="/employees" className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition">
          Kembali
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 dark:border-slate-700/50 p-6 md:p-8 shadow-sm">
        
        <div className="mb-6 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-700/50">
          <div>
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Belum punya format Excel?</p>
            <p className="text-xs text-indigo-700 dark:text-indigo-400">Gunakan template agar tanggal & NIK terbaca.</p>
          </div>
          <DownloadTemplateButton />
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* TAHAP 1: UPLOAD FILE */}
        {stagedData.length === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pilih File Excel (.xlsx)</label>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileRead}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
            </div>
            {isLoading && <p className="text-sm text-indigo-600 animate-pulse">Membaca file...</p>}
          </div>
        )}

        {/* TAHAP 2: KONFIRMASI (STAGING) */}
        {stagedData.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-50 text-emerald-800 p-5 rounded-xl border border-emerald-200">
              <h3 className="font-bold text-lg mb-1">File Berhasil Dibaca!</h3>
              <p className="text-sm">Ditemukan <strong>{stagedData.length} baris</strong> data.</p>
              
              {duplicateCount > 0 ? (
                <p className="text-sm mt-3 font-semibold text-amber-700 bg-amber-100 p-2 rounded-lg inline-block">
                  ⚠️ Terdapat {duplicateCount} data duplikat (NIK Lama/KTP sudah ada di sistem).
                </p>
              ) : (
                <p className="text-sm mt-3 font-semibold text-emerald-700 bg-emerald-100 p-2 rounded-lg inline-block">
                  ✅ Tidak ada duplikat. Data siap disimpan.
                </p>
              )}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 text-center">Pilih Aksi Eksekusi:</p>
              
              {/* TOMBOL JIKA ADA DUPLIKAT */}
              {duplicateCount > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <button onClick={() => handleExecute('skip')} disabled={isLoading} className="w-full text-left px-4 py-3 bg-white border border-slate-300 rounded-lg hover:border-indigo-500 transition-colors">
                      <strong className="block text-slate-800">Abaikan Ganda (Skip)</strong>
                      <span className="text-xs text-slate-500">Hanya data baru yang masuk.</span>
                   </button>
                   <button onClick={() => handleExecute('overwrite')} disabled={isLoading} className="w-full text-left px-4 py-3 bg-white border border-slate-300 rounded-lg hover:border-amber-500 transition-colors">
                      <strong className="block text-slate-800">Timpa Data Lama</strong>
                      <span className="text-xs text-slate-500">Perbarui data lama dengan Excel.</span>
                   </button>
                </div>
              ) : (
                /* TOMBOL JIKA TIDAK ADA DUPLIKAT */
                <button 
                  onClick={() => handleExecute('skip')} 
                  disabled={isLoading} 
                  className="w-full text-center px-4 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md active:scale-[0.98]"
                >
                  {isLoading ? 'Memproses Data...' : 'Konfirmasi & Simpan Semua Data'}
                </button>
              )}
            </div>
            
            <button onClick={() => setStagedData([])} disabled={isLoading} className="text-sm text-slate-500 hover:text-slate-800 underline w-full text-center">
              Batal dan unggah file lain
            </button>
          </div>
        )}

      </div>
    </div>
  );
}