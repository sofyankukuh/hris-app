// src/modules/employee/employee.types.ts

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export type Employee = {
  id: string;
  tenantId: string;
  
  // Identitas Utama
  employeeNumber: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  joinDate: Date;
  status: EmployeeStatus;
  
  // Data Pribadi
  birthDate?: Date | null;
  birthPlace?: string | null;
  gender?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  motherName?: string | null;
  spouseName?: string | null;
  childrenCount?: number | null;
  
  // Identitas & Alamat
  ktpNumber?: string | null;
  npwpNumber?: string | null;
  jamsostekNumber?: string | null;
  address?: string | null;
  
  // Kepegawaian
  department: string;
  position: string;
  education?: string | null;
  customer?: string | null;
  branchCode?: string | null;
  outlet?: string | null;
  
  // Kontrak
  contractStart?: Date | null;
  contractEnd?: Date | null;
  contractNumber?: string | null;
  exitDate?: Date | null;

  // Finansial
  bankName?: string | null;
  bankAccount?: string | null;
  
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEmployeeInput = Partial<Omit<Employee, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>;