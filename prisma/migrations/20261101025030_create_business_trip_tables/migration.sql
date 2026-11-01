-- CreateTable
CREATE TABLE "BusinessTrip" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessTripApproval" (
    "id" TEXT NOT NULL,
    "businessTripId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "notes" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "BusinessTripApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessTrip_tenantId_idx" ON "BusinessTrip"("tenantId");

-- AddForeignKey
ALTER TABLE "BusinessTrip" ADD CONSTRAINT "BusinessTrip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTrip" ADD CONSTRAINT "BusinessTrip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTripApproval" ADD CONSTRAINT "BusinessTripApproval_businessTripId_fkey" FOREIGN KEY ("businessTripId") REFERENCES "BusinessTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTripApproval" ADD CONSTRAINT "BusinessTripApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
