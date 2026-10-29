// src/modules/employee/employee.types.ts

/**
 * Status karyawan dalam sistem.
 * - ACTIVE: Karyawan tetap/kontrak yang masih bekerja.
 * - INACTIVE: Karyawan yang sudah resign atau dihentikan.
 * - ON_LEAVE: Karyawan yang sedang cuti panjang (misal: cuti melahirkan).
 */
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

/**
 * Tipe data inti untuk Karyawan.
 * Ini adalah "cetak biru" yang akan dipakai di seluruh modul.
 */
export type Employee = {
  id: string;
  tenantId: string;       // ID Perusahaan (untuk multi-tenant)
  employeeNumber: string; // NIK / Nomor Induk Karyawan
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  department: string;
  position: string;
  joinDate: Date;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Tipe data untuk membuat karyawan baru.
 * Kita tidak butuh `id`, `createdAt`, `updatedAt` karena itu dibuat otomatis oleh database.
 */
export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Tipe data untuk memperbarui karyawan.
 * Semua field opsional, karena kita mungkin hanya ingin mengubah satu-dua field saja.
 */
export type UpdateEmployeeInput = Partial<Omit<Employee, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>;