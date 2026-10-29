// src/modules/employee/employee.schema.ts

import { z } from 'zod';

/**
 * Skema validasi untuk membuat karyawan baru.
 * Zod akan memeriksa semua aturan di bawah ini sebelum data disimpan.
 */
export const createEmployeeSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID wajib diisi'),
  employeeNumber: z
    .string()
    .min(3, 'Nomor karyawan minimal 3 karakter')
    .max(20, 'Nomor karyawan maksimal 20 karakter'),
  fullName: z
    .string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter'),
  email: z
    .string()
    .email('Format email tidak valid'),
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,13}$/, 'Format nomor telepon Indonesia tidak valid')
    .nullable()
    .optional(),
  department: z
    .string()
    .min(2, 'Nama departemen minimal 2 karakter'),
  position: z
    .string()
    .min(2, 'Nama jabatan minimal 2 karakter'),
  joinDate: z
    .coerce.date({ message: 'Tanggal masuk tidak valid' }), // otomatis konversi string ke Date
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
    .default('ACTIVE'),
});

/**
 * Skema validasi untuk memperbarui karyawan.
 * Menggunakan `.partial()` agar semua field menjadi opsional.
 */
export const updateEmployeeSchema = createEmployeeSchema.partial();