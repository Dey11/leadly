import { MonitorStatus, Platform } from "@prisma/client";
import { z } from "zod/v4";

const icpCoreSchema = z
  .object({
    name: z.string().min(1).max(100),
    summary: z.string().min(1).max(2000),
    targetPersona: z.string().min(1).max(2000),
    pains: z.string().min(1).max(2000),
    valueProposition: z.string().min(1).max(2000),
    qualifyingSignals: z.string().min(1).max(2000),
    disqualifyingSignals: z.string().min(1).max(2000),
    platform: z.enum(Platform),
  })
  .strict();

export const createIcpSchema = icpCoreSchema;

export const updateIcpSchema = icpCoreSchema
  .partial()
  .extend({
    status: z.enum(MonitorStatus).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update the ICP.",
  );

export const icpIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();
