// src/components/DownloadTemplateButton.tsx
"use client";

import * as XLSX from 'xlsx';

export default function DownloadTemplateButton() {
      const handleDownload = () => {
    const headers = [
      "Nama", "Email", "NIK (BKP-001)", "No_KTP", "no_hp", "Jabatan", 
      "Departemen", "Pendidikan", "Tgl_Lahir (DD-MM-YYYY)", "Tempat_Lahir", 
      "Agama", "Rumusan", "Alamat", "NamaIbuKandung", 
      "NamaIstri", "J.Anak", "no_jamsostek", "npwp_karyawan", 
      "nama_rek_karyawan", "rekening", "tgl_masuk (DD-MM-YYYY)", 
      "tgl_mulai_kontrak (DD-MM-YYYY)", "tgl_selesai_kontrak (DD-MM-YYYY)", "no_kontrak"
    ];

    const dummyData = [
      {
        "Nama": "Budi Santoso",
        "Email": "budi@perusahaan.com",
        "NIK (BKP-001)": "BKP-001", // <-- SUDAH DISTANDARKAN
        "No_KTP": "3175014305031001",
        "no_hp": "081234567890",
        "Jabatan": "STAFF IT",
        "Departemen": "IT",
        "Pendidikan": "S1",
        "Tgl_Lahir (DD-MM-YYYY)": "31-12-1995",
        "Tempat_Lahir": "Jakarta",
        "Agama": "Islam",
        "Rumusan": "TK/0",
        "Alamat": "Jl. Mangga IV No.16",
        "NamaIbuKandung": "Siti Aminah",
        "NamaIstri": "-",
        "J.Anak": 0,
        "no_jamsostek": "25062176729",
        "npwp_karyawan": "046483350001000",
        "nama_rek_karyawan": "Bank BCA",
        "rekening": "1234567890",
        "tgl_masuk (DD-MM-YYYY)": "01-05-2025",
        "tgl_mulai_kontrak (DD-MM-YYYY)": "01-05-2025",
        "tgl_selesai_kontrak (DD-MM-YYYY)": "01-05-2026",
        "no_kontrak": "A.40063.01/ADM.1/BKP/V/2025"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(dummyData, { header: headers });
    const wscols = headers.map(() => ({ wch: 25 }));
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Karyawan");
    XLSX.writeFile(workbook, "Template_Import_HRIS.xlsx");
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