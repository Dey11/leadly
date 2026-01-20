import { Request, Response } from "express";
import logger from "../lib/logger";
import db from "../lib/db";
import {
  createKeywordMonitorSchema,
  updateKeywordMonitorSchema,
  keywordMonitorIdParamSchema,
} from "../types/keyword-monitor";
import { TIER_LIMITS } from "../lib/constants";
import { Reddit } from "../services/reddit";
import { env } from "../env";

export async function createKeywordMonitor(req: Request, res: Response) {
  try {
    const payload = createKeywordMonitorSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const user = await db.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return res.status(400).json({ error: "User has no active subscription" });
    }

    const tier = user.subscription.tier;
    const tierLimits = TIER_LIMITS[tier];

    // Check keyword monitor limit
    const existingCount = await db.keywordMonitor.count({
      where: { userId: req.userId! },
    });

    if (existingCount >= tierLimits.keywordMonitors) {
      return res.status(400).json({
        error: `Monitor limit reached. Your ${tier} plan allows ${tierLimits.keywordMonitors} keyword monitors.`,
      });
    }

    // Validate KeywordSet ownership
    const keywordSet = await db.keywordSet.findUnique({
      where: { id: payload.data.keywordSetId },
    });

    if (!keywordSet || keywordSet.userId !== req.userId!) {
      return res
        .status(400)
        .json({ error: "KeywordSet not found or not owned by user" });
    }

    // Validate subreddit
    if (payload.data.platform === "REDDIT") {
      const reddit = new Reddit(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET);
      const isValid = await reddit.validateSubreddit(payload.data.target);

      if (!isValid) {
        return res.status(400).json({
          error: `Subreddit "${payload.data.target}" is not valid or accessible`,
        });
      }
    }

    const monitor = await db.keywordMonitor.create({
      data: {
        userId: req.userId!,
        keywordSetId: payload.data.keywordSetId,
        platform: payload.data.platform,
        target: payload.data.target,
      },
      include: {
        keywordSet: true,
      },
    });

    res.status(201).json(monitor);
  } catch (err) {
    logger.error("Failed to create keyword monitor:", err);
    res.status(500).json({ error: "Failed to create keyword monitor" });
  }
}

export async function getKeywordMonitors(req: Request, res: Response) {
  try {
    const monitors = await db.keywordMonitor.findMany({
      where: { userId: req.userId },
      include: {
        keywordSet: true,
        scrapeJobs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    res.json(monitors);
  } catch (err) {
    logger.error("Failed to fetch keyword monitors:", err);
    res.status(500).json({ error: "Failed to fetch keyword monitors" });
  }
}

export async function getKeywordMonitor(req: Request, res: Response) {
  try {
    const params = keywordMonitorIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const monitor = await db.keywordMonitor.findFirst({
      where: {
        id: params.data.id,
        userId: req.userId!,
      },
      include: {
        keywordSet: true,
        scrapeJobs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!monitor) {
      return res.status(404).json({ error: "Monitor not found" });
    }

    res.json(monitor);
  } catch (err) {
    logger.error("Failed to fetch keyword monitor:", err);
    res.status(500).json({ error: "Failed to fetch keyword monitor" });
  }
}

export async function updateKeywordMonitor(req: Request, res: Response) {
  try {
    const params = keywordMonitorIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const payload = updateKeywordMonitorSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Check ownership
    const existing = await db.keywordMonitor.findFirst({
      where: {
        id: params.data.id,
        userId: req.userId!,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Monitor not found" });
    }

    // Validate KeywordSet if changing
    if (payload.data.keywordSetId) {
      const keywordSet = await db.keywordSet.findUnique({
        where: { id: payload.data.keywordSetId },
      });

      if (!keywordSet || keywordSet.userId !== req.userId!) {
        return res
          .status(400)
          .json({ error: "KeywordSet not found or not owned by user" });
      }
    }

    const monitor = await db.keywordMonitor.update({
      where: { id: params.data.id },
      data: payload.data,
      include: {
        keywordSet: true,
      },
    });

    res.json(monitor);
  } catch (err) {
    logger.error("Failed to update keyword monitor:", err);
    res.status(500).json({ error: "Failed to update keyword monitor" });
  }
}

export async function deleteKeywordMonitor(req: Request, res: Response) {
  try {
    const params = keywordMonitorIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const deleted = await db.keywordMonitor.deleteMany({
      where: {
        id: params.data.id,
        userId: req.userId!,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Monitor not found" });
    }

    res.json({ message: "Monitor deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete keyword monitor:", err);
    res.status(500).json({ error: "Failed to delete keyword monitor" });
  }
}
