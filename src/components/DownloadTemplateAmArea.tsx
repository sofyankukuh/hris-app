// src/components/DownloadTemplateAmArea.tsx
"use client";

import * as XLSX from 'xlsx';

export default function DownloadTemplateAmArea() {
  const handleDownload = () => {
    const headers = ["NIK AM", "Kode Cabang"];
    const dummyData = [
      { "NIK AM": "BKP-001", "Kode Cabang": "BR01" },
      { "NIK AM": "BKP-001", "Kode Cabang": "BR02" }
    ];

    const worksheet = XLSX.utils.json_to_sheet(dummyData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template AM Area");
    XLSX.writeFile(workbook, "Template_AM_Area.xlsx");
  };

  return (
    <button 
      onClick={handleDownload}
      type="button"
      className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-2"
    >
      <span className="text-base">📄</span> Download Template
    </button>
  );
}