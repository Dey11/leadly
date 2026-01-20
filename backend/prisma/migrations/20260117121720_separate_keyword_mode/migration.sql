/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BugReportCategory" AS ENUM ('BUG', 'FEATURE_REQUEST', 'QUESTION', 'OTHER');

-- CreateEnum
CREATE TYPE "BugReportSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BugReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "scrape_jobs" ADD COLUMN     "nextRetryAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailOtp" TEXT,
ADD COLUMN     "emailOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "bug_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "BugReportCategory" NOT NULL,
    "severity" "BugReportSeverity",
    "pageUrl" TEXT,
    "status" "BugReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledHours" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyword_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_sets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyword_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_scrape_jobs" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "originalJobId" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewNotes" TEXT,

    CONSTRAINT "failed_scrape_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_monitors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keywordSetId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'REDDIT',
    "target" TEXT NOT NULL,
    "cursor" TEXT,
    "status" "MonitorStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastScrapedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyword_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_scrape_jobs" (
    "id" TEXT NOT NULL,
    "keywordMonitorId" TEXT NOT NULL,
    "status" "ScrapeJobStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "metadata" JSONB,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyword_scrape_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_leads" (
    "id" TEXT NOT NULL,
    "scrapeJobId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "author" TEXT,
    "matchedKeywords" TEXT[],
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyword_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bug_reports_userId_idx" ON "bug_reports"("userId");

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "bug_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "keyword_schedules_userId_key" ON "keyword_schedules"("userId");

-- CreateIndex
CREATE INDEX "keyword_sets_userId_idx" ON "keyword_sets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "failed_scrape_jobs_originalJobId_key" ON "failed_scrape_jobs"("originalJobId");

-- CreateIndex
CREATE INDEX "failed_scrape_jobs_monitorId_idx" ON "failed_scrape_jobs"("monitorId");

-- CreateIndex
CREATE INDEX "failed_scrape_jobs_reviewed_idx" ON "failed_scrape_jobs"("reviewed");

-- CreateIndex
CREATE INDEX "keyword_monitors_userId_idx" ON "keyword_monitors"("userId");

-- CreateIndex
CREATE INDEX "keyword_monitors_keywordSetId_idx" ON "keyword_monitors"("keywordSetId");

-- CreateIndex
CREATE INDEX "keyword_scrape_jobs_keywordMonitorId_idx" ON "keyword_scrape_jobs"("keywordMonitorId");

-- CreateIndex
CREATE INDEX "keyword_scrape_jobs_status_retryCount_nextRetryAt_idx" ON "keyword_scrape_jobs"("status", "retryCount", "nextRetryAt");

-- CreateIndex
CREATE INDEX "keyword_scrape_jobs_createdAt_idx" ON "keyword_scrape_jobs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "keyword_leads_url_key" ON "keyword_leads"("url");

-- CreateIndex
CREATE INDEX "keyword_leads_scrapeJobId_idx" ON "keyword_leads"("scrapeJobId");

-- CreateIndex
CREATE INDEX "keyword_leads_status_idx" ON "keyword_leads"("status");

-- CreateIndex
CREATE INDEX "keyword_leads_createdAt_idx" ON "keyword_leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_leadType_idx" ON "leads"("leadType");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "scrape_jobs_status_retryCount_nextRetryAt_idx" ON "scrape_jobs"("status", "retryCount", "nextRetryAt");

-- CreateIndex
CREATE INDEX "scrape_jobs_createdAt_idx" ON "scrape_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "users"("resetToken");

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_schedules" ADD CONSTRAINT "keyword_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_sets" ADD CONSTRAINT "keyword_sets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "failed_scrape_jobs" ADD CONSTRAINT "failed_scrape_jobs_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_monitors" ADD CONSTRAINT "keyword_monitors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_monitors" ADD CONSTRAINT "keyword_monitors_keywordSetId_fkey" FOREIGN KEY ("keywordSetId") REFERENCES "keyword_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_scrape_jobs" ADD CONSTRAINT "keyword_scrape_jobs_keywordMonitorId_fkey" FOREIGN KEY ("keywordMonitorId") REFERENCES "keyword_monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_leads" ADD CONSTRAINT "keyword_leads_scrapeJobId_fkey" FOREIGN KEY ("scrapeJobId") REFERENCES "keyword_scrape_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
