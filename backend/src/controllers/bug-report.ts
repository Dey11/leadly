import { Request, Response } from "express";
import db from "../lib/db";
import { createBugReportSchema } from "../types/bug-report";
import { sendBugReportToDiscord } from "../lib/discord";

export async function createBugReport(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const parsed = createBugReportSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { title, description, category, severity, pageUrl } = parsed.data;

    const bugReport = await db.bugReport.create({
      data: {
        userId,
        title,
        description,
        category,
        severity: severity ?? null,
        pageUrl: pageUrl || null,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Send to Discord webhook (fire and forget, don't block response)
    sendBugReportToDiscord(bugReport).catch((error) => {
      console.error("Failed to send bug report to Discord:", error);
    });

    return res.status(201).json({
      message: "Bug report submitted successfully",
      payload: {
        id: bugReport.id,
        title: bugReport.title,
        category: bugReport.category,
        status: bugReport.status,
        createdAt: bugReport.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating bug report:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function listBugReports(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bugReports = await db.bugReport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        severity: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Bug reports retrieved successfully",
      payload: bugReports,
    });
  } catch (error) {
    console.error("Error listing bug reports:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
