import { z } from "zod/v4";
import { LeadStatus, Platform } from "@prisma/client";

export const getKeywordLeadsQuerySchema = z
  .object({
    keywordMonitorId: z.string().cuid().optional(),
    platform: z.enum(Platform).optional(),
    status: z.enum(LeadStatus).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const keywordLeadIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();

export const updateKeywordLeadSchema = z
  .object({
    status: z.enum(LeadStatus),
  })
  .strict();
