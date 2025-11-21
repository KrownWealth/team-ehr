-- AlterTable
ALTER TABLE "users" ADD COLUMN     "patientId" TEXT;

-- CreateIndex
CREATE INDEX "users_patientId_idx" ON "users"("patientId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
