// src/components/DownloadTemplateIncome.tsx
"use client";

import * as XLSX from 'xlsx';

export default function DownloadTemplateIncome() {
  const handleDownload = () => {
    const headers = ["NIK", "Jenis (LEMBUR/SPD/OPD)", "Tanggal (DD-MM-YYYY)", "Nominal", "Keterangan"];
    const dummyData = [
      { 
        "NIK": "BKP-001", 
        "Jenis (LEMBUR/SPD/OPD)": "LEMBUR", 
        "Tanggal (DD-MM-YYYY)": "01-05-2026", 
        "Nominal": 150000, 
        "Keterangan": "Lembur Proyek A" 
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(dummyData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Pendapatan");
    XLSX.writeFile(workbook, "Template_Import_Pendapatan.xlsx");
  };

  return (
    <button 
      onClick={handleDownload}
      type="button"
      className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-2"
    >
      <span className="text-base">📄</span> Download Template Excel
    </button>
  );
}