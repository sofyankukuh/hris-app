/*
  Warnings:

  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropTable
DROP TABLE "RolePermission";

-- CreateTable
CREATE TABLE "_EmployeeToPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmployeeToPermission_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmployeeToPermission_B_index" ON "_EmployeeToPermission"("B");

-- CreateIndex
CREATE INDEX "Employee_fullName_idx" ON "Employee"("fullName");

-- CreateIndex
CREATE INDEX "Employee_employeeNumber_idx" ON "Employee"("employeeNumber");

-- AddForeignKey
ALTER TABLE "_EmployeeToPermission" ADD CONSTRAINT "_EmployeeToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToPermission" ADD CONSTRAINT "_EmployeeToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
