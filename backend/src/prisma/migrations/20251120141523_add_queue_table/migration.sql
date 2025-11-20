-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "queue" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "queue_clinicId_idx" ON "queue"("clinicId");

-- CreateIndex
CREATE INDEX "queue_patientId_idx" ON "queue"("patientId");

-- CreateIndex
CREATE INDEX "queue_status_idx" ON "queue"("status");

-- CreateIndex
CREATE INDEX "queue_clinicId_status_idx" ON "queue"("clinicId", "status");

-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue" ADD CONSTRAINT "queue_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
