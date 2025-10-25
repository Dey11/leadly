import { MonitorStatus, Platform } from "@prisma/client";
import { z } from "zod/v4";

const monitorBaseSchema = z
  .object({
    platform: z.enum(Platform),
    targets: z.array(
      z.object({
        subreddit: z.string().min(1),
        cursor: z.string().nullable(),
      })
    ),
    leadDescription: z.string().min(1),
    scrapeIntervalMinutes: z.number().int().positive(),
  })
  .strict();

export const createMonitorSchema = monitorBaseSchema;

export const updateMonitorSchema = monitorBaseSchema
  .partial()
  .extend({
    status: z.enum(MonitorStatus).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update the monitor."
  );

export const monitorIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();
