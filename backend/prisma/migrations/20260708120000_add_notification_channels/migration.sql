-- CreateEnum
CREATE TYPE "NotificationChannelType" AS ENUM ('DISCORD');

-- CreateTable
CREATE TABLE "notification_channels" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationChannelType" NOT NULL DEFAULT 'DISCORD',
    "destination" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "notifyLeadTypes" "LeadType"[] DEFAULT ARRAY['WARM', 'COLD', 'NEUTRAL']::"LeadType"[],
    "notifyKeywordMatches" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_channels_userId_idx" ON "notification_channels"("userId");

-- AddForeignKey
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

