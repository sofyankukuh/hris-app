// src/components/DeleteBatchButton.tsx
"use client";

import { useTransition } from 'react';
import { deleteBatch } from '@/app/(dashboard)/payroll/report/actions';

export default function DeleteBatchButton({ batchId }: { batchId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus seluruh data gaji di batch ini? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteBatch(batchId);
        alert("✅ Batch berhasil dihapus.");
      } catch (error: any) {
        alert(`❌ Gagal menghapus: ${error.message}`);
      }
    });
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-2 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
      title="Hapus Batch"
    >
      {isPending ? '...' : '🗑️ Hapus'}
    </button>
  );
}