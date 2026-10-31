// src/app/(dashboard)/attendance/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link'; // <-- Wajib ada untuk tombol Monitor
import { handleAttendance, getTodayAttendance } from './actions';

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Efek untuk jam berjalan & cek status absensi
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Cek apakah hari ini sudah absen
    getTodayAttendance().then((data) => {
      if (data?.checkIn && !data?.checkOut) {
        setIsClockedIn(true); // Sudah masuk tapi belum keluar
      } else if (data?.checkOut) {
        setIsClockedIn(false); // Sudah selesai kerja
      }
    });

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await handleAttendance('IN');
      setIsClockedIn(true);
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal Clock In');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await handleAttendance('OUT');
      setIsClockedIn(false);
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal Clock Out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Header dengan Tombol Monitor */}
      <div className="mb-8 text-center relative">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Absensi Harian</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Silakan lakukan Clock In saat mulai bekerja dan Clock Out saat selesai.</p>
        
        {/* TOMBOL MONITOR HRD (Hanya muncul di desktop) */}
        <div className="absolute top-0 right-0 hidden md:block">
          <Link 
            href="/attendance/manage" 
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
          >
            Monitor HRD &rarr;
          </Link>
        </div>
      </div>

      {/* Kartu Utama Jam & Tombol */}
      <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-700/50 p-10 shadow-xl text-center">
        
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Jam Digital */}
        <div className="mb-10">
          <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest text-sm mb-2">
            Waktu Saat Ini
          </p>
          <div className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
            {isMounted ? currentTime.toLocaleTimeString('id-ID', { hour12: false }) : '--:--:--'}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            {isMounted ? currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Memuat tanggal...'}
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-center mt-8">
          {!isClockedIn ? (
            <button 
              onClick={handleClockIn}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              <span className="relative z-10">{isLoading ? 'Memproses...' : 'Clock In'}</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold rounded-full border border-emerald-100 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sedang Bekerja
              </div>
              
              <button 
                onClick={handleClockOut}
                disabled={isLoading}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                <span className="relative z-10">{isLoading ? 'Memproses...' : 'Clock Out'}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}