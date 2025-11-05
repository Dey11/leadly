import { Request, Response } from "express";
import db from "../lib/db";
import { updateScheduleSchema } from "../types/schedule";
import { DEFAULT_HOURS_MAP, TIER_LIMITS } from "../lib/constants";

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await db.userSchedule.upsert({
      where: { userId: req.userId! },
      update: {},
      create: {
        userId: req.userId!,
        scheduledHours: [12],
      },
    });

    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const payload = updateScheduleSchema.safeParse(req.body);

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

      const invalidHours = hours.filter((h) => h < 0 || h > 23);
      if (invalidHours.length > 0) {
        return res
          .status(400)
          .json({ error: "Hours must be between 0 and 23" });
      }
    }

    const schedule = await db.userSchedule.upsert({
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
    res.status(500).json({ error: "Failed to update schedule" });
  }
};

export const getTierLimits = async (req: Request, res: Response) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return res.status(400).json({ error: "User has no active subscription" });
    }

    const tier = user.subscription.tier;
    const limits = TIER_LIMITS[tier];

    res.json({
      tier,
      limits,
      currentSchedule: await db.userSchedule.findUnique({
        where: { userId: req.userId! },
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tier limits" });
  }
};
