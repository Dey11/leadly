import { Request, Response } from "express";
import logger from "../lib/logger";
import db from "../lib/db";

/**
 * Get keyword mode dashboard statistics
 */
export async function getKeywordStats(req: Request, res: Response) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Count keyword sets
    const keywordSetsCount = await db.keywordSet.count({
      where: { userId: req.userId! },
    });

    // Count keyword monitors
    const keywordMonitorsCount = await db.keywordMonitor.count({
      where: { userId: req.userId! },
    });

    // Count total matches (keyword leads)
    const totalMatches = await db.keywordLead.count({
      where: {
        scrapeJob: {
          keywordMonitor: {
            userId: req.userId!,
          },
        },
      },
    });

    // Count matches in last 7 days
    const matchesLast7Days = await db.keywordLead.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        scrapeJob: {
          keywordMonitor: {
            userId: req.userId!,
          },
        },
      },
    });

    // Get keyword monitors with their stats for recent activity
    const monitors = await db.keywordMonitor.findMany({
      where: { userId: req.userId! },
      select: {
        id: true,
        target: true,
        status: true,
        lastScrapedAt: true,
        keywordSet: {
          select: {
            id: true,
            name: true,
          },
        },
        scrapeJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            matchCount: true,
            completedAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Build recent activity from latest scrape jobs
    const recentActivity = monitors
      .filter((m) => m.scrapeJobs.length > 0)
      .map((m) => ({
        keywordMonitorId: m.id,
        target: m.target,
        keywordSetName: m.keywordSet.name,
        keywordSetId: m.keywordSet.id,
        lastScrapeJob: m.scrapeJobs[0],
      }))
      .sort((a, b) => {
        const aDate = new Date(a.lastScrapeJob.createdAt);
        const bDate = new Date(b.lastScrapeJob.createdAt);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 6);

    // Count active vs paused monitors
    const activeMonitors = monitors.filter((m) => m.status === "ACTIVE").length;
    const pausedMonitors = monitors.filter((m) => m.status === "PAUSED").length;

    // Find the last completed job for spotlight cards
    const lastCompletedJob = await db.keywordScrapeJob.findFirst({
      where: {
        keywordMonitor: { userId: req.userId! },
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
      select: {
        completedAt: true,
        matchCount: true,
      },
    });

    res.json({
      message: "Keyword stats retrieved successfully.",
      payload: {
        keywordSetsCount,
        keywordMonitorsCount,
        activeMonitors,
        pausedMonitors,
        totalMatches,
        matchesLast7Days,
        recentActivity,
        lastCompletedAt: lastCompletedJob?.completedAt?.toISOString() ?? null,
        lastJobMatches: lastCompletedJob?.matchCount ?? 0,
      },
    });
  } catch (err) {
    logger.error("Failed to fetch keyword stats:", err);
    res.status(500).json({ error: "Failed to fetch keyword stats" });
  }
}
