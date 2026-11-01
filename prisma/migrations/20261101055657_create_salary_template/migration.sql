-- CreateTable
CREATE TABLE "SalaryTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryTemplateDetail" (
    "id" TEXT NOT NULL,
    "salaryTemplateId" TEXT NOT NULL,
    "salaryComponentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SalaryTemplateDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSalaryTemplate" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryTemplateId" TEXT NOT NULL,

    CONSTRAINT "EmployeeSalaryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryTemplateDetail_salaryTemplateId_salaryComponentId_key" ON "SalaryTemplateDetail"("salaryTemplateId", "salaryComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSalaryTemplate_employeeId_key" ON "EmployeeSalaryTemplate"("employeeId");

-- AddForeignKey
ALTER TABLE "SalaryTemplate" ADD CONSTRAINT "SalaryTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryTemplateDetail" ADD CONSTRAINT "SalaryTemplateDetail_salaryTemplateId_fkey" FOREIGN KEY ("salaryTemplateId") REFERENCES "SalaryTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryTemplateDetail" ADD CONSTRAINT "SalaryTemplateDetail_salaryComponentId_fkey" FOREIGN KEY ("salaryComponentId") REFERENCES "SalaryComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryTemplate" ADD CONSTRAINT "EmployeeSalaryTemplate_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSalaryTemplate" ADD CONSTRAINT "EmployeeSalaryTemplate_salaryTemplateId_fkey" FOREIGN KEY ("salaryTemplateId") REFERENCES "SalaryTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
