// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Jika sukses, arahkan ke dashboard
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#020617] p-4 text-slate-200">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Portal Karyawan</h1>
          <p className="text-sm text-slate-400 mt-1">Sistem Informasi Karyawan Terpadu</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <input name="email" type="email" required className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="email@perusahaan.com" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
              <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Lupa Password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <input name="password" type="password" required className="w-full pl-10 pr-10 py-3 bg-[#0f172a] text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mt-2">
            {isLoading ? 'Memproses...' : 'Masuk ke Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}