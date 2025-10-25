import { z } from "zod/v4";

export const scheduleSchema = z
  .object({
    scheduledHours: z
      .array(z.number().int().min(0).max(23))
      .min(1)
      .max(24)
      .refine((hours) => {
        const uniqueHours = new Set(hours);
        return uniqueHours.size === hours.length;
      }, "Hours must be unique"),
  })
  .strict();

export const updateScheduleSchema = scheduleSchema.partial();
