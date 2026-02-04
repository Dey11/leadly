-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "generatedDm" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company" TEXT,
ADD COLUMN     "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "sampleDm" TEXT;
