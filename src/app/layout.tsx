// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <-- Pastikan ini ada di sini

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRIS Perusahaan",
  description: "Sistem Informasi Manajemen Karyawan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}