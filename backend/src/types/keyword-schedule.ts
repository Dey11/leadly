import { z } from "zod/v4";

export const createKeywordScheduleSchema = z.object({
  scheduledHours: z
    .array(z.number().int().min(0).max(23))
    .min(1, "At least one hour is required"),
});

export const updateKeywordScheduleSchema = z.object({
  scheduledHours: z
    .array(z.number().int().min(0).max(23))
    .min(1, "At least one hour is required")
    .optional(),
});
