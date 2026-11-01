// src/components/ExportPayrollButtons.tsx
"use client";

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type PayrollData = {
  id: string;
  employeeName: string;
  employeeNumber: string;
  month: number;
  year: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
};

export default function ExportPayrollButtons({ data }: { data: PayrollData[] }) {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const handleExportExcel = () => {
    const excelData = data.map((d) => ({
      "NIK": d.employeeNumber,
      "Nama Karyawan": d.employeeName,
      "Periode": `${monthNames[d.month - 1]} ${d.year}`,
      "Pendapatan": d.totalEarnings,
      "Potongan": d.totalDeductions,
      "Gaji Bersih": d.netSalary,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Payroll");
    XLSX.writeFile(workbook, `Laporan_Payroll_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF('landscape'); // Landscape agar tabel muat
    
    doc.setFontSize(16);
    doc.text("Laporan Payroll Karyawan", 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableData = data.map((d) => [
      d.employeeNumber,
      d.employeeName,
      `${monthNames[d.month - 1]} ${d.year}`,
      `Rp ${d.totalEarnings.toLocaleString('id-ID')}`,
      `Rp ${d.totalDeductions.toLocaleString('id-ID')}`,
      `Rp ${d.netSalary.toLocaleString('id-ID')}`,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['NIK', 'Nama Karyawan', 'Periode', 'Pendapatan', 'Potongan', 'Gaji Bersih']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo
    });

    doc.save(`Laporan_Payroll_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleExportExcel}
        className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-2"
      >
        📊 Download Excel
      </button>
      <button 
        onClick={handleExportPdf}
        className="px-4 py-2 bg-rose-50 text-rose-700 text-sm font-semibold rounded-xl hover:bg-rose-100 transition-colors shadow-sm flex items-center gap-2"
      >
        📄 Download PDF
      </button>
    </div>
  );
}