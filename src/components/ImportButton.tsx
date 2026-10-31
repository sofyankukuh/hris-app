// src/components/ImportButton.tsx
"use client";

import { useRouter } from 'next/navigation';

export default function ImportButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        console.log("Tombol diklik, mencoba pindah ke /incomes/import");
        router.push('/incomes/import');
      }}
      className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
    >
      📥 Import Excel
    </button>
  );
}