import { Request, Response } from "express";
import db from "../lib/db";
import {
  createKeywordScheduleSchema,
  updateKeywordScheduleSchema,
} from "../types/keyword-schedule";
import { DEFAULT_HOURS_MAP, TIER_LIMITS } from "../lib/constants";

export async function getKeywordSchedule(req: Request, res: Response) {
  try {
    const schedule = await db.keywordSchedule.findUnique({
      where: { userId: req.userId! },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Keyword schedule not found" });
    }

    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch keyword schedule" });
  }
}

export async function createKeywordSchedule(req: Request, res: Response) {
  try {
    const payload = createKeywordScheduleSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const existing = await db.keywordSchedule.findUnique({
      where: { userId: req.userId! },
    });

    if (existing) {
      return res.status(400).json({ error: "Keyword schedule already exists" });
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
    const hours = payload.data.scheduledHours;

    if (hours.length > tierLimits.selectableHours) {
      return res.status(400).json({
        error: `Your ${tier} plan allows only ${tierLimits.selectableHours} scheduled hours.`,
      });
    }

    const uniqueHours = new Set(hours);
    if (uniqueHours.size !== hours.length) {
      return res.status(400).json({ error: "Hours must be unique" });
    }

    const schedule = await db.keywordSchedule.create({
      data: {
        userId: req.userId!,
        scheduledHours: hours,
      },
    });

    res.status(201).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create keyword schedule" });
  }
}

export async function updateKeywordSchedule(req: Request, res: Response) {
  try {
    const payload = updateKeywordScheduleSchema.safeParse(req.body);

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

    if (payload.data.scheduledHours) {
      const hours = payload.data.scheduledHours;

      if (hours.length > tierLimits.selectableHours) {
        return res.status(400).json({
          error: `Your ${tier} plan allows only ${tierLimits.selectableHours} scheduled hours.`,
        });
      }

      const uniqueHours = new Set(hours);
      if (uniqueHours.size !== hours.length) {
        return res.status(400).json({ error: "Hours must be unique" });
      }
    }

    const schedule = await db.keywordSchedule.upsert({
      where: { userId: req.userId! },
      update: {
        ...payload.data,
      },
      create: {
        userId: req.userId!,
        scheduledHours:
          payload.data.scheduledHours ||
          (DEFAULT_HOURS_MAP[tier] as unknown as number[]),
      },
    });

    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update keyword schedule" });
  }
}
