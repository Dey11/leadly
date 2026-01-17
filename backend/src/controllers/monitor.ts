import { Request, Response } from "express";
import db from "../lib/db";
import {
  createMonitorSchema,
  monitorIdParamSchema,
  updateMonitorSchema,
} from "../types/monitor";
import { TIER_LIMITS } from "../lib/constants";
import { Reddit } from "../services/reddit";
import { env } from "../env";

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

    const { mode, icpId, keywordSetId } = payload.data;

    // Validate ICP if provided (required for LEAD_GEN, optional for KEYWORD)
    if (icpId) {
      const icp = await db.icp.findUnique({
        where: { id: icpId },
      });

      if (!icp || icp.userId !== req.userId!) {
        return res
          .status(400)
          .json({ error: "ICP not found or not owned by user" });
      }
    }

    // Validate KeywordSet if provided (required for KEYWORD mode)
    if (keywordSetId) {
      const keywordSet = await db.keywordSet.findUnique({
        where: { id: keywordSetId },
      });

      if (!keywordSet || keywordSet.userId !== req.userId!) {
        return res
          .status(400)
          .json({ error: "KeywordSet not found or not owned by user" });
      }
    }

    if (payload.data.platform === "REDDIT") {
      const reddit = new Reddit(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET);
      const isValid = await reddit.validateSubreddit(payload.data.target);

      if (!isValid) {
        return res.status(400).json({ error: "Invalid subreddit" });
      }
    }

    const monitor = await db.monitor.create({
      data: {
        mode,
        icpId: icpId || null,
        keywordSetId: keywordSetId || null,
        platform: payload.data.platform,
        target: payload.data.target,
        cursor: payload.data.cursor || null,
        userId: req.userId!,
      },
    });

    res.status(201).json(monitor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create monitor" });
  }
};

export const getMonitors = async (req: Request, res: Response) => {
  try {
    const monitors = await db.monitor.findMany({
      where: { userId: req.userId },
      include: {
        icp: true,
        keywordSet: true,
        scrapeJobs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    res.json(monitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monitors" });
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

    const monitor = await db.monitor.findUnique({ where: { id } });

    if (!monitor) return res.status(404).json({ error: "Monitor not found" });
    if (monitor.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

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

    // Validate KeywordSet if being updated
    if (payload.data.keywordSetId) {
      const keywordSet = await db.keywordSet.findUnique({
        where: { id: payload.data.keywordSetId },
        select: { id: true, userId: true },
      });
      if (!keywordSet || keywordSet.userId !== req.userId) {
        return res.status(400).json({
          error: "KeywordSet not found or not owned by the current user.",
        });
      }
    }

    if (payload.data.target && payload.data.platform === "REDDIT") {
      const reddit = new Reddit(env.REDDIT_CLIENT_ID, env.REDDIT_CLIENT_SECRET);
      const isValid = await reddit.validateSubreddit(payload.data.target);

      if (!isValid) {
        return res.status(400).json({ error: "Invalid subreddit" });
      }
    }

    const updatedMonitor = await db.monitor.update({
      where: { id },
      data: {
        ...payload.data,
      },
    });

    res.json(updatedMonitor);
  } catch (err) {
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

