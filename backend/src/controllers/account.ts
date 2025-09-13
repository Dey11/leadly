import { Request, Response } from "express";
import db from "../lib/db";
import { patchAccountSchema } from "../types/account";

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
        credits: findExistingUser?.credits,
        createdAt: findExistingUser?.createdAt,
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
    if (!payload) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const updateUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        ...payload.data,
      },
    });

    res.status(200).json({
      message: "Account updated successfully.",
      payload: {
        id: userId,
        name: payload.data?.name,
        email: payload.data?.email,
        image: payload.data?.image,
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
    await db.user.delete({
      where: {
        id: userId,
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
        // isCurrent: session.isCurrent,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
