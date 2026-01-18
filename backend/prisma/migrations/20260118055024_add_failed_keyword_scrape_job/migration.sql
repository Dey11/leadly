-- CreateTable
CREATE TABLE "failed_keyword_scrape_jobs" (
    "id" TEXT NOT NULL,
    "keywordMonitorId" TEXT NOT NULL,
    "originalJobId" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewNotes" TEXT,

    CONSTRAINT "failed_keyword_scrape_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "failed_keyword_scrape_jobs_originalJobId_key" ON "failed_keyword_scrape_jobs"("originalJobId");

-- CreateIndex
CREATE INDEX "failed_keyword_scrape_jobs_keywordMonitorId_idx" ON "failed_keyword_scrape_jobs"("keywordMonitorId");

-- CreateIndex
CREATE INDEX "failed_keyword_scrape_jobs_reviewed_idx" ON "failed_keyword_scrape_jobs"("reviewed");

-- AddForeignKey
ALTER TABLE "failed_keyword_scrape_jobs" ADD CONSTRAINT "failed_keyword_scrape_jobs_keywordMonitorId_fkey" FOREIGN KEY ("keywordMonitorId") REFERENCES "keyword_monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
