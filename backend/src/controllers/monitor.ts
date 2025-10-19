import { Request, Response } from "express";
import db from "../lib/db";
import {
  createMonitorSchema,
  monitorIdParamSchema,
  updateMonitorSchema,
} from "../types/monitor";

export const createMonitor = async (req: Request, res: Response) => {
  try {
    const payload = createMonitorSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const monitor = await db.monitor.create({
      data: {
        ...payload.data,
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
