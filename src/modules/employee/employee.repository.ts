// src/modules/employee/employee.repository.ts

import prisma from '@/lib/prisma';
import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from './employee.types';

/**
 * Repository: Tempat khusus untuk berkomunikasi dengan database.
 * Hanya file ini yang boleh menyentuh Prisma secara langsung.
 */
export const employeeRepository = {
  // 1. Membuat karyawan baru
  async create(data: CreateEmployeeInput): Promise<Employee> {
    return await prisma.employee.create({
      data: {
        ...data,
        // Prisma akan otomatis mengisi id, createdAt, updatedAt
      },
    });
  },

  // 2. Mengambil semua karyawan berdasarkan tenant (perusahaan)
  async findAllByTenant(tenantId: string): Promise<Employee[]> {
    return await prisma.employee.findMany({
      where: { tenantId },
      orderBy: { fullName: 'asc' }, // Urutkan berdasarkan nama A-Z
    });
  },

  // 3. Mengambil satu karyawan berdasarkan ID dan tenant
  async findById(tenantId: string, id: string): Promise<Employee | null> {
    return await prisma.employee.findFirst({
      where: { id, tenantId }, // Pastikan hanya bisa akses data tenant sendiri
    });
  },

  // 4. Memperbarui data karyawan
  async update(tenantId: string, id: string, data: UpdateEmployeeInput): Promise<Employee> {
    // Catatan: Prisma update butuh 'where' yang unik (id). 
    // Kita tambahkan pengecekan tenantId di logika service nanti.
    return await prisma.employee.update({
      where: { id },
      data,
    });
  },

  // 5. Menghapus karyawan (soft delete atau hard delete nanti)
  async delete(tenantId: string, id: string): Promise<Employee> {
    return await prisma.employee.delete({
      where: { id },
    });
  },
};