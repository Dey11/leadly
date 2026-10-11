ALTER TABLE "subscriptions" ADD COLUMN "lastBillingEventAt" TIMESTAMP(3);

-- Historical webhook IDs may repeat. Keep all records; serialize new deliveries
-- with transaction advisory locks and use this index for durable deduplication.
CREATE INDEX "webhook_events_webhookId_idx" ON "webhook_events"("webhookId");
