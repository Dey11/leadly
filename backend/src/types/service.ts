import { MonitorStatus, Platform } from "@prisma/client";
import { z } from "zod/v4";

const serviceBaseSchema = z
  .object({
    name: z.string().min(1).max(100),
    leadDescription: z.string().min(1).max(5000),
    platform: z.enum(Platform),
  })
  .strict();

export const createServiceSchema = serviceBaseSchema;

export const updateServiceSchema = serviceBaseSchema
  .partial()
  .extend({
    status: z.enum(MonitorStatus).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update the service."
  );

export const serviceIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();
