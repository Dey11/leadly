ALTER TYPE "ScrapeJobStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "users"
ADD COLUMN "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "freeAutomationPausedAt" TIMESTAMP(3);

CREATE INDEX "users_lastActiveAt_freeAutomationPausedAt_idx"
ON "users"("lastActiveAt", "freeAutomationPausedAt");
