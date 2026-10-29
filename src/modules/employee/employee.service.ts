// src/modules/employee/employee.service.ts

import { employeeRepository } from './employee.repository';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema';
import { CreateEmployeeInput, UpdateEmployeeInput } from './employee.types';

/**
 * Service: Otak dari modul ini.
 * Tugasnya: Validasi input (lewat schema), lalu panggil repository.
 */
export const employeeService = {
  // 1. Logika untuk membuat karyawan baru
  async createEmployee(input: unknown) {
    // Validasi input menggunakan Zod
    const validatedData = createEmployeeSchema.parse(input);

    // Cek apakah email sudah terdaftar di tenant yang sama (opsional, tapi disarankan)
    // Nanti kita tambahkan pengecekan duplikasi di sini.

    // Panggil repository untuk menyimpan ke database
    const newEmployee = await employeeRepository.create(validatedData);
    return newEmployee;
  },

  // 2. Logika untuk mengambil daftar karyawan
  async getEmployees(tenantId: string) {
    if (!tenantId) throw new Error('Tenant ID wajib diisi');
    return await employeeRepository.findAllByTenant(tenantId);
  },

  // 3. Logika untuk mengambil detail satu karyawan
  async getEmployeeById(tenantId: string, id: string) {
    const employee = await employeeRepository.findById(tenantId, id);
    if (!employee) {
      throw new Error('Karyawan tidak ditemukan');
    }
    return employee;
  },

  // 4. Logika untuk update
  async updateEmployee(tenantId: string, id: string, input: unknown) {
    // Validasi input update
    const validatedData = updateEmployeeSchema.parse(input);

    // Pastikan karyawan ada dan milik tenant yang benar sebelum update
    const existing = await employeeRepository.findById(tenantId, id);
    if (!existing) throw new Error('Karyawan tidak ditemukan atau bukan milik perusahaan Anda');

    return await employeeRepository.update(tenantId, id, validatedData);
  },

  // 5. Logika untuk hapus
  async deleteEmployee(tenantId: string, id: string) {
    const existing = await employeeRepository.findById(tenantId, id);
    if (!existing) throw new Error('Karyawan tidak ditemukan');

    return await employeeRepository.delete(tenantId, id);
  },
};