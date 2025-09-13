import { Request, Response } from "express";
import db from "../lib/db";

export const createMonitor = async (req: Request, res: Response) => {
  try {
    const { platform, target, leadDescription, scrapeIntervalMinutes } =
      req.body;

    const monitor = await db.monitor.create({
      data: {
        platform,
        target,
        leadDescription,
        scrapeIntervalMinutes,
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
    });

    res.json(monitors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monitors" });
  }
};

export const updateMonitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { platform, target, leadDescription, scrapeIntervalMinutes, status } =
      req.body;

    const monitor = await db.monitor.update({
      where: { id },
      data: {
        platform,
        target,
        leadDescription,
        scrapeIntervalMinutes,
        status,
      },
    });

    res.json(monitor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update monitor" });
  }
};

export const deleteMonitor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.monitor.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete monitor" });
  }
};
