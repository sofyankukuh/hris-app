/*
  Warnings:

  - You are about to drop the column `isFixed` on the `SalaryComponent` table. All the data in the column will be lost.
  - You are about to drop the `EmployeeSalary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeSalaryComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryStructure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalaryStructureDetail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmployeeSalary" DROP CONSTRAINT "EmployeeSalary_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSalary" DROP CONSTRAINT "EmployeeSalary_salaryStructureId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSalaryComponent" DROP CONSTRAINT "EmployeeSalaryComponent_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSalaryComponent" DROP CONSTRAINT "EmployeeSalaryComponent_salaryComponentId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryStructure" DROP CONSTRAINT "SalaryStructure_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryStructureDetail" DROP CONSTRAINT "SalaryStructureDetail_salaryComponentId_fkey";

-- DropForeignKey
ALTER TABLE "SalaryStructureDetail" DROP CONSTRAINT "SalaryStructureDetail_salaryStructureId_fkey";

-- AlterTable
ALTER TABLE "SalaryComponent" DROP COLUMN "isFixed";

-- DropTable
DROP TABLE "EmployeeSalary";

-- DropTable
DROP TABLE "EmployeeSalaryComponent";

-- DropTable
DROP TABLE "SalaryStructure";

-- DropTable
DROP TABLE "SalaryStructureDetail";

-- CreateTable
CREATE TABLE "EmployeeSalaryConfig" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryComponentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EmployeeSalaryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalaryMaster" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryComponentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EmployeeSalaryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSalaryConfig_employeeId_salaryComponentId_key" ON "EmployeeSalaryConfig"("employeeId", "salaryComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSalaryMaster_employeeId_salaryComponentId_key" ON "EmployeeSalaryMaster"("employeeId", "salaryComponentId");

-- AddForeignKey
ALTER TABLE "EmployeeSalaryConfig" ADD CONSTRAINT "EmployeeSalaryConfig_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryConfig" ADD CONSTRAINT "EmployeeSalaryConfig_salaryComponentId_fkey" FOREIGN KEY ("salaryComponentId") REFERENCES "SalaryComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryMaster" ADD CONSTRAINT "EmployeeSalaryMaster_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryMaster" ADD CONSTRAINT "EmployeeSalaryMaster_salaryComponentId_fkey" FOREIGN KEY ("salaryComponentId") REFERENCES "SalaryComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
