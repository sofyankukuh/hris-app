# 📘 BUKU INDUK APLIKASI: HRIS PERUSAHAAN (BKP)
*Dokumen ini adalah "KTP Aplikasi". Selalu bawa dokumen ini saat berkonsultasi dengan AI di masa depan.*

## 1. IDENTITAS APLIKASI
- **Nama Aplikasi**: HRIS BKP (Human Resource Information System)
- **Tujuan**: Mengelola data karyawan, absensi, cuti, tenaga pengganti, dan penggajian untuk 11.000 karyawan.
- **Lokasi Proyek**: `C:\Users\Lenovo\Projects\hris-app` (Kantor) / `C:\Projects\hris-app` (Rumah)
- **GitHub**: https://github.com/sofyankukuh/hris-app.git

## 2. STACK TEKNOLOGI (WAJIB)
- **Framework**: Next.js 16.4.3 (App Router, **Webpack** - JANGAN pakai Turbopack)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL 18 (Prisma 7)
- **Auth**: NextAuth (JWT)

## 3. ARSITEKTUR & STRUKTUR
- **Pola**: Modular Monolith.
- **Folder UI**: `src/app/(dashboard)` untuk halaman admin.
- **Folder Logika**: `src/app/(dashboard)/.../actions.ts` (Server Actions).
- **Folder Komponen**: `src/components` (Sidebar, Export, dll).
- **Library Khusus**: `src/lib/prisma.ts` (Koneksi DB), `src/lib/auth.ts` (Login).

## 4. ATURAN BISNIS & KONSEP (JANGAN DIUBAH)
1. **Multi-Tenant**: Semua data punya `tenantId`. (Saat ini: PT BKP).
2. **Role**: TAD, AM, HC, Legal, IT, Client, Superadmin.
3. **Pemisahan Biodata & Akun**: Biodata di-input HRD. Hak Akses diatur Superadmin.
4. **TAD**: Akses paten (Absen, Cuti, Slip Gaji). Tidak butuh centang manual.
5. **Wilayah AM**: Satu AM bisa mengawasi banyak cabang (tabel `AmArea`).
6. **Cuti & Resign**: Alur berjenjang TAD -> AM -> HC.
7. **Reliever**: Terpisah dari Employee. Absensi pakai Link Unik + Selfie + GPS. Email otomatis saat HC setuju.
8. **Payroll (Rumus Dinamis)**: 
   - HRD membuat "Rumus" (centang komponen).
   - HRD tempelkan Rumus ke Karyawan (bisa massal).
   - Nominal Gaji Pokok diambil dari **Master Gaji**.
   - **Batch Payroll**: Setiap proses simpan akan membuat ID Batch baru.
   - **Cut Off**: Input manual oleh HRD (Tanggal Awal & Akhir). Tumpang tindih tanggal akan memunculkan peringatan, tapi bisa dilanjutkan.
   - **Draft vs Paid**: Jika DRAFT, bisa ditimpa (proses ulang). Jika PAID, terkunci (tidak bisa ditimpa).
9. **Laporan Payroll**: Berbasis Batch. Bisa export Excel/PDF, dan Tandai PAID (dengan peringatan).

## 5. MODUL YANG SUDAH SELESAI (STATUS: OK)
1. **Auth**: Login, Logout, Middleware.
2. **Karyawan**: CRUD, Auto NIK, Import Excel.
3. **Absensi**: Clock In/Out, Monitor HRD.
4. **Cuti**: Form TAD, Approval AM/HC, Upload lampiran.
5. **Resign**: Form TAD, Approval AM/HC, Upload surat.
6. **SPD**: Pengajuan perjalanan dinas kantor pusat.
7. **Reliever**: Input AM, Link absensi unik, Email otomatis, Monitoring.
8. **Pendapatan Tambahan**: Import Excel Lembur/SPD/OPD.
9. **Payroll**: Setting Rumus, Apply Rumus, Generate Batch, Cek Tumpang Tindih.
10. **Laporan Payroll**: Daftar Batch, Detail Batch, Tandai PAID, Export Excel/PDF, Hapus Batch (Superadmin).

## 6. SISA PEKERJAAN (TO-DO LIST BESOK)
1. **Download PDF Slip Gaji (TAD)**: TAD bisa download slip gaji (pakai `jspdf`).
2. **Master Pinjaman**: Tabel & UI untuk potongan pinjaman.
3. **Master BPJS/PPh**: Menyimpan persentase tetap (sekarang masih hardcode 2% & 5%).
4. **RBAC (Hak Akses Menu)**: Menyembunyikan menu di Sidebar sesuai centangan.
5. **Modul Client**: Dashboard khusus client.
6. **Rapel (Payroll Adjustment)**: Fitur penyesuaian untuk gaji yang sudah PAID.

## 7. CATATAN ERROR & SOLUSI (TROUBLESHOOTING)
- **Error "Body exceeded 1MB"**: File upload terlalu besar. Kompres file atau ubah `next.config.ts`.
- **Error Prisma "Column does not exist"**: Jalankan `npx prisma migrate dev` lalu `npx prisma generate`.
- **Error "Module not found" / Halaman 404**: Hapus folder `.next` (`Remove-Item -Recurse -Force .next`), lalu restart server.
- **Error TypeScript "Property does not exist"**: Tekan `Ctrl + Shift + P` -> `Restart TS Server`.
- **Error NextAuth "useSession must be wrapped"**: Pastikan `src/app/layout.tsx` dibungkus `<SessionProvider>`.
- **Error "Tanggal cut off tumpang tindih"**: Ini peringatan. Klik OK untuk lanjut, atau periksa kembali tanggal input.