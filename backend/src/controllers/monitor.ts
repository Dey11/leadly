import { Request, Response } from "express";
import logger from "../lib/logger";
import db from "../lib/db";
import {
  createMonitorSchema,
  monitorIdParamSchema,
  updateMonitorSchema,
} from "../types/monitor";
import { TIER_LIMITS } from "../lib/constants";
import { Reddit } from "../services/reddit";
import { env } from "../env";
import { parseCustomFeedTarget } from "../lib/reddit-target";
import {
  DuplicateMonitorError,
  DUPLICATE_MONITOR_MESSAGE,
  createMonitorWithIdentityGuard,
  normalizeMonitorTargetForStorage,
  updateMonitorWithIdentityGuard,
} from "../services/monitor-identity";

const CUSTOM_FEED_UPGRADE_MESSAGE =
  "Custom feeds are a Premium feature. Upgrade to Premium to monitor Reddit lists.";
const INVALID_CUSTOM_FEED_MESSAGE =
  "Invalid custom feed. Paste a link like reddit.com/user/<name>/m/<feed>.";

export const createMonitor = async (req: Request, res: Response) => {
  try {
    const payload = createMonitorSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({
        error: payload.error.issues[0]?.message || "Invalid request body",
      });
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

    const currentMonitorCount = await db.monitor.count({
      where: { userId: req.userId! },
    });

    if (currentMonitorCount >= tierLimits.monitors) {
      return res.status(400).json({
        error: `Monitor limit reached. Your ${tier} plan allows ${tierLimits.monitors} monitors.`,
      });
    }

    // Validate ICP ownership
    const icp = await db.icp.findUnique({
      where: { id: payload.data.icpId },
    });

    if (!icp || icp.userId !== req.userId!) {
      return res
        .status(400)
        .json({ error: "ICP not found or not owned by user" });
    }

    // Validate the target (subreddit or custom feed)
    const targetType = payload.data.targetType ?? "SUBREDDIT";
    let target = payload.data.target;

    if (payload.data.platform === "REDDIT") {
      const reddit = new Reddit(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET);

      if (targetType === "CUSTOM_FEED") {
        if (!tierLimits.customFeeds) {
          return res.status(403).json({ error: CUSTOM_FEED_UPGRADE_MESSAGE });
        }

        const parsed = parseCustomFeedTarget(target);
        if (!parsed) {
          return res.status(400).json({ error: INVALID_CUSTOM_FEED_MESSAGE });
        }

        const isValid = await reddit.validateCustomFeed(
          parsed.owner,
          parsed.name,
        );
        if (!isValid) {
          return res
            .status(400)
            .json({ error: "Custom feed not found or is private" });
        }

        target = `${parsed.owner}/${parsed.name}`;
      } else {
        const isValid = await reddit.validateSubreddit(target);

        if (!isValid) {
          return res.status(400).json({ error: "Invalid subreddit" });
        }
      }
    }

    target = normalizeMonitorTargetForStorage(target);
    const monitor = await createMonitorWithIdentityGuard({
      icpId: payload.data.icpId,
      platform: payload.data.platform,
      target,
      targetType,
      userId: req.userId!,
    });

    res.status(201).json(monitor);
  } catch (err) {
    if (err instanceof DuplicateMonitorError) {
      return res.status(409).json({ error: DUPLICATE_MONITOR_MESSAGE });
    }
    logger.error("Failed to create monitor:", err);
    res.status(500).json({ error: "Failed to create monitor" });
  }
};

export const getMonitors = async (req: Request, res: Response) => {
  try {
    const monitors = await db.monitor.findMany({
      where: { userId: req.userId },
      include: {
        icp: true,
        scrapeJobs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });
    res.json(monitors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch monitors" });
  }
};

export const getMonitor = async (req: Request, res: Response) => {
  try {
    const idResult = monitorIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const { id } = idResult.data;

    const monitor = await db.monitor.findFirst({
      where: { id, userId: req.userId },
      include: {
        icp: true,
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
    res.status(500).json({ error: "Failed to fetch monitor" });
  }
};

export const updateMonitor = async (req: Request, res: Response) => {
  try {
    const idResult = monitorIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const payload = updateMonitorSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { id } = idResult.data;

    const existing = await db.monitor.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Monitor not found" });
    }

    // Validate ICP if being updated
    if (payload.data.icpId) {
      const icp = await db.icp.findUnique({
        where: { id: payload.data.icpId },
        select: { id: true, userId: true },
      });
      if (!icp || icp.userId !== req.userId) {
        return res.status(400).json({
          error: "ICP not found or not owned by the current user.",
        });
      }
    }

    // Validate the target (subreddit or custom feed) if being updated
    const effectivePlatform = payload.data.platform ?? existing.platform;
    const effectiveTargetType = payload.data.targetType ?? existing.targetType;
    let target = payload.data.target;

    if (target && effectivePlatform === "REDDIT") {
      const reddit = new Reddit(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET);

      if (effectiveTargetType === "CUSTOM_FEED") {
        const user = await db.user.findUnique({
          where: { id: req.userId! },
          include: { subscription: true },
        });

        if (
          !user?.subscription ||
          !TIER_LIMITS[user.subscription.tier].customFeeds
        ) {
          return res.status(403).json({ error: CUSTOM_FEED_UPGRADE_MESSAGE });
        }

        const parsed = parseCustomFeedTarget(target);
        if (!parsed) {
          return res.status(400).json({ error: INVALID_CUSTOM_FEED_MESSAGE });
        }

        const isValid = await reddit.validateCustomFeed(
          parsed.owner,
          parsed.name,
        );
        if (!isValid) {
          return res
            .status(400)
            .json({ error: "Custom feed not found or is private" });
        }

        target = `${parsed.owner}/${parsed.name}`;
      } else {
        const isValid = await reddit.validateSubreddit(target);

        if (!isValid) {
          return res.status(400).json({ error: "Invalid subreddit" });
        }
      }
    }

    if (target) {
      target = normalizeMonitorTargetForStorage(target);
    }

    const identity = {
      icpId: payload.data.icpId ?? existing.icpId,
      platform: effectivePlatform,
      targetType: effectiveTargetType,
      target: target ?? existing.target,
    };
    const updatedMonitor = await updateMonitorWithIdentityGuard({
      id,
      identity,
      data: { ...payload.data, ...(target ? { target } : {}) },
    });

    res.json(updatedMonitor);
  } catch (err) {
    if (err instanceof DuplicateMonitorError) {
      return res.status(409).json({ error: DUPLICATE_MONITOR_MESSAGE });
    }
    res.status(500).json({ error: "Failed to update monitor" });
  }
};

export const deleteMonitor = async (req: Request, res: Response) => {
  try {
    const idResult = monitorIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const { id } = idResult.data;

    const monitor = await db.monitor.findUnique({ where: { id } });

    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    if (monitor.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    await db.monitor.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete monitor" });
  }
};
