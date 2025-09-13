import { NextFunction, Request, Response } from "express";
import db from "../lib/db";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionToken = req.cookies.session_token;
  if (!sessionToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const session = await db.session.findUnique({
    where: {
      token: sessionToken,
    },
  });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (session.expiresAt < new Date()) {
    await db.session.delete({
      where: {
        token: sessionToken,
      },
    });
    return res.status(401).json({ error: "Session expired" });
  }

  req.userId = session.userId;

  next();
}
