import { z } from "zod/v4";
import { Platform, MonitorStatus, RedditTargetType } from "@prisma/client";

export const createKeywordMonitorSchema = z
  .object({
    keywordSetId: z.string().cuid(),
    platform: z.enum(Platform).default("REDDIT"),
    target: z.string().min(1).max(300),
    targetType: z.enum(RedditTargetType).default("SUBREDDIT"),
  })
  .strict();

export const updateKeywordMonitorSchema = z
  .object({
    keywordSetId: z.string().cuid().optional(),
    target: z.string().min(1).max(300).optional(),
    targetType: z.enum(RedditTargetType).optional(),
    status: z.enum(MonitorStatus).optional(),
  })
  .strict();

export const keywordMonitorIdParamSchema = z
  .object({
    id: z.string().cuid(),
  })
  .strict();
