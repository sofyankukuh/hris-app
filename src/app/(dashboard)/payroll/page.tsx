// src/app/(dashboard)/payroll/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getPayrollPreview, calculatePayrollDetails, savePayroll, getAllComponents } from './actions';
import Link from 'next/link';

export default function PayrollPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [rawData, setRawData] = useState<any[]>([]);
  const [calculatedData, setCalculatedData] = useState<any[]>([]);
  
  const [earningsMaster, setEarningsMaster] = useState<any[]>([]);
  const [deductionsMaster, setDeductionsMaster] = useState<any[]>([]);
  
  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => {
    getAllComponents().then(comps => {
      setEarningsMaster(comps.filter(c => c.type === 'EARNING'));
      setDeductionsMaster(comps.filter(c => c.type === 'DEDUCTION'));
    });
  }, []);

  const handlePreview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const filters = { 
      customer: formData.get('customer') as string, 
      branchCode: formData.get('branchCode') as string, 
      position: formData.get('position') as string 
    };
    try {
      const result = await getPayrollPreview(new Date(startDate), new Date(endDate), filters);
      setRawData(result);
      setStep(2);
    } catch (error) { alert("Gagal mengambil data."); } finally { setIsLoading(false); }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    const selectedIds = rawData
      .filter((_, index) => (document.getElementById(`check_raw_${index}`) as HTMLInputElement)?.checked)
      .map(d => d.id);
    if (selectedIds.length === 0) { alert("Pilih minimal 1 karyawan."); setIsLoading(false); return; }

    try {
      const result = await calculatePayrollDetails(selectedIds, new Date(startDate), new Date(endDate));
      setCalculatedData(result);
    } catch (error) { alert("Gagal menghitung rincian gaji."); } finally { setIsLoading(false); }
  };

  const handleSave = async (force: boolean = false) => {
    const selected = calculatedData.filter((_, index) => (document.getElementById(`check_calc_${index}`) as HTMLInputElement)?.checked);
    if (selected.length === 0) return alert("Pilih minimal 1 karyawan.");
    
    setIsLoading(true);
    try {
      const result = await savePayroll(selected, new Date(startDate), new Date(endDate), force);
      
      if (!result.success && result.warning) {
        setIsLoading(false);
        if (confirm(result.warning)) {
          handleSave(true); // Panggil ulang dengan force = true
        }
        return;
      }

      if (result.success) {
        alert(`✅ Proses Selesai!\n\nBaru: ${result.savedCount}\nDiperbarui: ${result.updatedCount}\nDilewati (PAID): ${result.skippedCount}`);
        setStep(1);
        setRawData([]);
        setCalculatedData([]);
      }
    } catch (error: any) { 
      alert(`❌ Gagal menyimpan: ${error.message}`); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const formatRupiah = (val: number) => {
    if (val === 0) return "0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-[95vw] mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Proses Payroll</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {step === 1 ? 'Step 1: Filter & Tampilkan Data' : 'Step 2: Verifikasi Rincian & Generate'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/payroll/rumus" className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-colors flex items-center gap-2">
            ⚙️ Atur Rumus
          </Link>
          {step === 2 && (
            <button onClick={() => { setStep(1); setRawData([]); setCalculatedData([]); }} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
              Kembali ke Filter
            </button>
          )}
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handlePreview} className="bg-white dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Awal</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Akhir</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Customer</label><input name="customer" placeholder="Semua Customer" className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Cabang</label><input name="branchCode" placeholder="Semua Cabang" className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm" /></div>
          </div>
          <div className="flex justify-end"><button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md">{isLoading ? 'Memuat...' : '1. Tampilkan Data'}</button></div>
        </form>
      )}

      {step === 2 && calculatedData.length === 0 && (
        <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-3 w-10 text-center"><input type="checkbox" onChange={(e) => document.querySelectorAll('input[name="emp_raw"]').forEach((c: any) => c.checked = e.target.checked)} /></th>
                <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Nama</th>
                <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Hadir</th>
                <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Alpa</th>
                <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {rawData.map((emp, index) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 text-center"><input type="checkbox" name="emp_raw" id={`check_raw_${index}`} defaultChecked className="w-4 h-4 text-indigo-600 rounded" /></td>
                  <td className="p-3"><p className="font-bold text-slate-800 dark:text-slate-100">{emp.fullName}</p><p className="text-xs text-slate-500">{emp.employeeNumber}</p></td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{emp.hadir} hari</td>
                  <td className="p-3 text-rose-600">{emp.alpa} hari</td>
                  <td className="p-3 text-xs">
                    {emp.pendingResign && <span className="text-rose-500 font-bold block">Resign Pending</span>}
                    {emp.pendingLeave && <span className="text-amber-500 font-bold block">Cuti Pending</span>}
                    {!emp.pendingResign && !emp.pendingLeave && <span className="text-emerald-500">Aman</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button onClick={handleCalculate} disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md">
              {isLoading ? 'Menghitung...' : '2. Hitung Rincian Gaji'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && calculatedData.length > 0 && (
        <div>
          <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="p-3 w-10 text-center sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-20">
                      <input type="checkbox" onChange={(e) => document.querySelectorAll('input[name="emp_calc"]').forEach((c: any) => c.checked = e.target.checked)} />
                    </th>
                    <th className="p-3 font-bold text-slate-600 dark:text-slate-300 sticky left-10 bg-slate-50 dark:bg-slate-800/50 z-20 border-r border-slate-200 dark:border-slate-700">Karyawan</th>
                    
                    <th className="p-3 font-bold text-emerald-600 text-center border-l border-slate-200 dark:border-slate-700" colSpan={earningsMaster.length + 1}>PENDAPATAN (+)</th>
                    <th className="p-3 font-bold text-rose-600 text-center border-l border-slate-200 dark:border-slate-700" colSpan={deductionsMaster.length + 1}>POTONGAN (-)</th>
                    <th className="p-3 font-bold text-indigo-600 text-right border-l border-slate-200 dark:border-slate-700">GAJI BERSIH</th>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-xs">
                    <th className="sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-20"></th>
                    <th className="sticky left-10 bg-slate-50 dark:bg-slate-800/50 z-20 border-r border-slate-200 dark:border-slate-700"></th>
                    
                    {earningsMaster.map(c => <th key={c.id} className="p-2 font-bold text-slate-500 border-l border-slate-200 dark:border-slate-700">{c.name}</th>)}
                    <th className="p-2 font-bold text-emerald-700 border-l border-slate-200 dark:border-slate-700">Total (+)</th>
                    
                    {deductionsMaster.map(c => <th key={c.id} className="p-2 font-bold text-slate-500 border-l border-slate-200 dark:border-slate-700">{c.name}</th>)}
                    <th className="p-2 font-bold text-rose-700 border-l border-slate-200 dark:border-slate-700">Total (-)</th>
                    
                    <th className="border-l border-slate-200 dark:border-slate-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {calculatedData.map((emp, index) => (
                    <tr key={emp.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 text-center sticky left-0 bg-white dark:bg-slate-800 z-10">
                        <input type="checkbox" name="emp_calc" id={`check_calc_${index}`} defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                      </td>
                      <td className="p-3 sticky left-10 bg-white dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{emp.fullName}</p>
                        <p className="text-xs text-slate-500">{emp.employeeNumber} - {emp.branchCode}</p>
                      </td>
                      
                      {earningsMaster.map(c => (
                        <td key={c.id} className="p-3 text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700">{formatRupiah(emp.earningsMap[c.name] || 0)}</td>
                      ))}
                      <td className="p-3 font-bold text-emerald-700 border-l border-slate-200 dark:border-slate-700">{formatRupiah(emp.totalEarnings)}</td>
                      
                      {deductionsMaster.map(c => (
                        <td key={c.id} className="p-3 text-rose-600 font-medium border-l border-slate-200 dark:border-slate-700">
                          {(emp.deductionsMap[c.name] || 0) > 0 ? `- ${formatRupiah(emp.deductionsMap[c.name])}` : '0'}
                        </td>
                      ))}
                      <td className="p-3 font-bold text-rose-700 border-l border-slate-200 dark:border-slate-700">- {formatRupiah(emp.totalDeductions)}</td>
                      
                      <td className="p-3 text-right font-bold text-indigo-600 text-base border-l border-slate-200 dark:border-slate-700">{formatRupiah(emp.netSalary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end gap-2 mb-10">
            <button onClick={() => setCalculatedData([])} className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Kembali</button>
            <button onClick={() => handleSave(false)} disabled={isLoading} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md">
              {isLoading ? 'Menyimpan...' : '✅ Konfirmasi & Simpan Gaji'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}