import { Request, Response } from "express";
import logger from "../lib/logger";
import db from "../lib/db";
import { TIER_LIMITS } from "../lib/constants";
import {
  upsertNotificationChannelSchema,
  testNotificationSchema,
} from "../types/notification";
import { sendTestNotification } from "../services/notification.service";
import type { LeadType } from "@prisma/client";

const NOTIFICATIONS_UPGRADE_MESSAGE =
  "Real-time Discord alerts are available on the Pro and Premium plans. Upgrade to enable notifications.";

const DEFAULT_NOTIFY_LEAD_TYPES: LeadType[] = ["WARM", "COLD", "NEUTRAL"];

export async function getNotificationSettings(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return res.status(400).json({ error: "User has no active subscription" });
    }

    const tier = user.subscription.tier;
    const allowed = TIER_LIMITS[tier].notifications;

    const channel = await db.notificationChannel.findFirst({
      where: { userId, type: "DISCORD" },
    });

    res.status(200).json({
      message: "Notification settings retrieved",
      payload: {
        tier,
        allowed,
        channel: channel
          ? {
              id: channel.id,
              type: channel.type,
              destination: channel.destination,
              enabled: channel.enabled,
              notifyLeadTypes: channel.notifyLeadTypes,
              notifyKeywordMatches: channel.notifyKeywordMatches,
            }
          : {
              id: null,
              type: "DISCORD" as const,
              destination: "",
              enabled: true,
              notifyLeadTypes: DEFAULT_NOTIFY_LEAD_TYPES,
              notifyKeywordMatches: true,
            },
      },
    });
  } catch (err) {
    logger.error("Failed to fetch notification settings:", err);
    res.status(500).json({ error: "Failed to fetch notification settings" });
  }
}

export async function upsertNotificationChannel(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const payload = upsertNotificationChannelSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return res.status(400).json({ error: "User has no active subscription" });
    }

    if (!TIER_LIMITS[user.subscription.tier].notifications) {
      return res.status(403).json({ error: NOTIFICATIONS_UPGRADE_MESSAGE });
    }

    const existing = await db.notificationChannel.findFirst({
      where: { userId, type: payload.data.type },
    });

    const data = {
      destination: payload.data.destination,
      enabled: payload.data.enabled,
      notifyLeadTypes: payload.data.notifyLeadTypes,
      notifyKeywordMatches: payload.data.notifyKeywordMatches,
    };

    const channel = existing
      ? await db.notificationChannel.update({
          where: { id: existing.id },
          data,
        })
      : await db.notificationChannel.create({
          data: {
            userId,
            type: payload.data.type,
            ...data,
          },
        });

    res.status(200).json({
      message: "Notification settings saved",
      payload: {
        id: channel.id,
        type: channel.type,
        destination: channel.destination,
        enabled: channel.enabled,
        notifyLeadTypes: channel.notifyLeadTypes,
        notifyKeywordMatches: channel.notifyKeywordMatches,
      },
    });
  } catch (err) {
    logger.error("Failed to save notification settings:", err);
    res.status(500).json({ error: "Failed to save notification settings" });
  }
}

export async function sendNotificationTestMessage(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const payload = testNotificationSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return res.status(400).json({ error: "User has no active subscription" });
    }

    if (!TIER_LIMITS[user.subscription.tier].notifications) {
      return res.status(403).json({ error: NOTIFICATIONS_UPGRADE_MESSAGE });
    }

    let destination = payload.data.destination;
    if (!destination) {
      const channel = await db.notificationChannel.findFirst({
        where: { userId, type: "DISCORD" },
      });
      destination = channel?.destination;
    }

    if (!destination) {
      return res
        .status(400)
        .json({ error: "No Discord webhook URL configured yet" });
    }

    const sent = await sendTestNotification(destination);

    if (!sent) {
      return res.status(502).json({
        error: "Failed to send test message. Double-check the webhook URL.",
      });
    }

    res.status(200).json({ message: "Test message sent", payload: {} });
  } catch (err) {
    logger.error("Failed to send test notification:", err);
    res.status(500).json({ error: "Failed to send test notification" });
  }
}
