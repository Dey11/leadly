import { LeadStatus, LeadType, Platform } from "@prisma/client";
import { z } from "zod/v4";

export const getLeadsQuerySchema = z
  .object({
    monitorId: z.string().cuid().optional(),
    platform: z.enum(Platform).optional(),
    leadType: z.enum(LeadType).optional(),
    status: z.enum(LeadStatus).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const leadIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();

export const updateLeadSchema = z
  .object({
    status: z.enum(LeadStatus),
  })
  .strict();

export const getScrapeJobsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(15),
  })
  .strict();

export const monitorIdParamSchema = z
  .object({
    monitorId: z.string().cuid(),
  })
  .strict();
