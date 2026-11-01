// src/app/(dashboard)/payroll/report/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBatchDetails, markBatchAsPaid } from '../actions';
import ExportPayrollButtons from '@/components/ExportPayrollButtons';

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBatchDetails(params.id as string).then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, [params.id]);

  const handleMarkPaid = async () => {
    const selected = data.filter((_, index) => (document.getElementById(`check_batch_${index}`) as HTMLInputElement)?.checked);
    if (selected.length === 0) return alert("Pilih minimal 1 data.");
    
    if (!confirm(`Tandai ${selected.length} data gaji sebagai PAID?`)) return;

    setIsLoading(true);
    try {
      await markBatchAsPaid(selected.map(d => d.id));
      alert("✅ Status berhasil diubah menjadi PAID.");
      window.location.reload();
    } catch (error) {
      alert("Gagal mengubah status.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const getSelectedData = () => {
    return data.filter((_, index) => (document.getElementById(`check_batch_${index}`) as HTMLInputElement)?.checked);
  };

  if (isLoading) return <div className="p-10 text-center">Memuat data...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Detail Payroll Batch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola data gaji untuk batch ini.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleMarkPaid} disabled={isLoading} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
            ✅ Tandai PAID
          </button>
          <ExportPayrollButtons data={getSelectedData()} />
          <button onClick={() => router.push('/payroll/report')} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
            Kembali
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input type="checkbox" onChange={(e) => {
                    document.querySelectorAll('input[name="selected_batch"]').forEach((c: any) => c.checked = e.target.checked);
                  }} />
                </th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Karyawan</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-emerald-600">Pendapatan (+)</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300 text-rose-600">Potongan (-)</th>
                <th className="p-4 font-bold text-indigo-600">Gaji Bersih</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {data.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 text-center">
                    <input type="checkbox" name="selected_batch" id={`check_batch_${index}`} defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{p.employee.fullName}</p>
                    <p className="text-xs text-slate-500">{p.employee.employeeNumber} - {p.employee.branchCode}</p>
                  </td>
                  <td className="p-4 text-emerald-600 font-medium">{formatRupiah(p.totalEarnings)}</td>
                  <td className="p-4 text-rose-600 font-medium">- {formatRupiah(p.totalDeductions)}</td>
                  <td className="p-4 font-bold text-indigo-600">{formatRupiah(p.netSalary)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}