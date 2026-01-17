import { MonitorMode, MonitorStatus, Platform } from "@prisma/client";
import { z } from "zod/v4";

const monitorBaseSchema = z
  .object({
    mode: z.enum(MonitorMode).default("LEAD_GEN"),
    icpId: z.string().cuid().nullable().optional(),
    keywordSetId: z.string().cuid().nullable().optional(),
    platform: z.enum(Platform),
    target: z.string().min(1),
    cursor: z.string().nullable().optional(),
  })
  .strict();

export const createMonitorSchema = monitorBaseSchema.refine(
  (data) => {
    // LEAD_GEN mode requires icpId
    if (data.mode === "LEAD_GEN" && !data.icpId) {
      return false;
    }
    // KEYWORD mode requires keywordSetId
    if (data.mode === "KEYWORD" && !data.keywordSetId) {
      return false;
    }
    return true;
  },
  {
    message:
      "LEAD_GEN mode requires icpId, KEYWORD mode requires keywordSetId",
  }
);

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

