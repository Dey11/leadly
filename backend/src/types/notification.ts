import { z } from "zod/v4";
import { NotificationChannelType } from "@prisma/client";

import { NOTIFIABLE_LEAD_TYPES } from "../lib/notification-policy";

// Matches https://discord.com/api/webhooks/<id>/<token> (also accepts the
// legacy discordapp.com host).
const DISCORD_WEBHOOK_URL_PATTERN =
  /^https:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+\/?$/;

const discordWebhookUrlSchema = z
  .string()
  .url()
  .regex(DISCORD_WEBHOOK_URL_PATTERN, "Must be a valid Discord webhook URL");

export const upsertNotificationChannelSchema = z
  .object({
    type: z.enum(NotificationChannelType).default("DISCORD"),
    destination: discordWebhookUrlSchema,
    enabled: z.boolean().default(true),
    notifyLeadTypes: z
      .array(z.enum(NOTIFIABLE_LEAD_TYPES))
      .min(1, "Select at least one lead type")
      .default([...NOTIFIABLE_LEAD_TYPES]),
    notifyKeywordMatches: z.boolean().default(true),
  })
  .strict();

export const testNotificationSchema = z
  .object({
    destination: discordWebhookUrlSchema.optional(),
  })
  .strict();
