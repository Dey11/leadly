ALTER TABLE "notification_channels" ALTER COLUMN "notifyLeadTypes" SET DEFAULT ARRAY['WARM', 'NEUTRAL']::"LeadType"[];
