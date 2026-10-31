-- CreateTable
CREATE TABLE "AdditionalIncome" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdditionalIncome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdditionalIncome_tenantId_idx" ON "AdditionalIncome"("tenantId");

-- CreateIndex
CREATE INDEX "AdditionalIncome_employeeId_idx" ON "AdditionalIncome"("employeeId");

-- AddForeignKey
ALTER TABLE "AdditionalIncome" ADD CONSTRAINT "AdditionalIncome_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalIncome" ADD CONSTRAINT "AdditionalIncome_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
