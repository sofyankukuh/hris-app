/*
  Warnings:

  - A unique constraint covering the columns `[uniqueToken]` on the table `RelieverAssignment` will be added. If there are existing duplicate values, this will fail.
  - The required column `uniqueToken` was added to the `RelieverAssignment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "RelieverAssignment" ADD COLUMN     "uniqueToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RelieverAssignment_uniqueToken_key" ON "RelieverAssignment"("uniqueToken");
