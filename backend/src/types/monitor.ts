import { MonitorStatus, Platform } from "@prisma/client";
import { z } from "zod/v4";

export const createMonitorSchema = z
  .object({
    icpId: z.string().cuid(),
    platform: z.enum(Platform),
    target: z.string().min(1),
  })
  .strict();

export const updateMonitorSchema = z
  .object({
    icpId: z.string().cuid().optional(),
    platform: z.enum(Platform).optional(),
    target: z.string().min(1).optional(),
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
    id: z.string().cuid(),
  })
  .strict();
