-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_clinicId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "clinicId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
