import { Request, Response } from "express";
import db from "../lib/db";
import { patchAccountSchema } from "../types/account";
import { previewUsage } from "../lib/usage";
import { SubscriptionTier } from "@prisma/client";

export async function getAccount(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const findExistingUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findExistingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const user = {
      data: {
        id: findExistingUser?.id,
        name: findExistingUser?.name,
        email: findExistingUser?.email,
        emailVerified: findExistingUser?.emailVerified,
        image: findExistingUser?.image,
        createdAt: findExistingUser?.createdAt,
        hasSeenWalkthrough:
          (findExistingUser as any).hasSeenWalkthrough ?? false,
      },
    };

    res
      .status(200)
      .json({ message: "User retrieved successfully", payload: user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function patchAccount(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const findExistingUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findExistingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const payload = patchAccountSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    if (payload.data.name === findExistingUser.name) {
      return res.status(400).json({ error: "Name is unchanged." });
    }

    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        name: payload.data.name,
      },
    });

    res.status(200).json({
      message: "Account updated successfully.",
      payload: {
        id: userId,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const findExistingUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findExistingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        isDeleted: true,
      },
    });
    res.status(200).json({
      message: "Account deleted successfully.",
      payload: {},
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAccountSessions(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const findExistingUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findExistingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const userSessions = await db.session.findMany({
      where: {
        userId: userId,
      },
    });

    res.status(200).json({
      message: "Active sessions retrieved.",
      payload: userSessions.map((session) => ({
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt: session.expiresAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUsageSummary(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return res.status(400).json({ error: "User has no active subscription" });
    }

    const billingContact = {
      name: user.subscription.billingName ?? undefined,
      email: user.subscription.billingEmail ?? undefined,
      phone: user.subscription.billingPhone ?? undefined,
      address: user.subscription.billingAddress ?? undefined,
    };

    const tier = user.subscription.tier as SubscriptionTier;
    const currentPeriodEnd = user.subscription.currentPeriodEnd;

    const usage = await previewUsage(userId, tier, currentPeriodEnd);

    return res.status(200).json({
      message: "Usage summary",
      payload: {
        tier,
        dailyUsed: usage.dailyUsed,
        dailyLimit: usage.dailyLimit,
        monthlyUsed: usage.monthlyUsed,
        monthlyLimit: usage.monthlyLimit,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
        billingContact,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
export async function updateWalkthroughStatus(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const findExistingUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!findExistingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        hasSeenWalkthrough: true,
      },
    });

    res.status(200).json({
      message: "Walkthrough status updated successfully.",
      payload: {},
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
