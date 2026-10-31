-- CreateTable
CREATE TABLE "Reliever" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ktpNumber" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reliever_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelieverAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "relieverId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "selfieUrl" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelieverAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reliever_tenantId_idx" ON "Reliever"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RelieverAssignment_leaveRequestId_key" ON "RelieverAssignment"("leaveRequestId");

-- CreateIndex
CREATE INDEX "RelieverAssignment_tenantId_idx" ON "RelieverAssignment"("tenantId");

-- AddForeignKey
ALTER TABLE "RelieverAssignment" ADD CONSTRAINT "RelieverAssignment_relieverId_fkey" FOREIGN KEY ("relieverId") REFERENCES "Reliever"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelieverAssignment" ADD CONSTRAINT "RelieverAssignment_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
