-- CreateTable
CREATE TABLE "AmArea" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amId" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,

    CONSTRAINT "AmArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AmArea_amId_branchCode_key" ON "AmArea"("amId", "branchCode");

-- AddForeignKey
ALTER TABLE "AmArea" ADD CONSTRAINT "AmArea_amId_fkey" FOREIGN KEY ("amId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
