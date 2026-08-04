import { MonitorStatus, Platform, RedditTargetType } from "@prisma/client";
import { z } from "zod/v4";

export const createMonitorSchema = z
  .object({
    icpId: z.string().cuid(),
    platform: z.enum(Platform),
    target: z.string().min(1),
    targetType: z.enum(RedditTargetType).default("SUBREDDIT"),
  })
  .strict();

export const updateMonitorSchema = z
  .object({
    icpId: z.string().cuid().optional(),
    platform: z.enum(Platform).optional(),
    target: z.string().min(1).optional(),
    targetType: z.enum(RedditTargetType).optional(),
    cursor: z.string().nullable().optional(),
    status: z.enum(MonitorStatus).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update the monitor.",
  );

export const monitorIdParamSchema = z
  .object({
    // Monitor IDs are opaque database identifiers. Production also contains
    // migrated records with `merged_monitors_...` IDs, so constraining route
    // params to newly generated CUIDs makes those valid records undeletable.
    id: z.string().trim().min(1).max(191),
  })
  .strict();
