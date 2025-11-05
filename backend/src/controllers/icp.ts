import { Request, Response } from "express";
import db from "../lib/db";
import {
  createIcpSchema,
  icpIdParamSchema,
  updateIcpSchema,
} from "../types/icp";

export const createIcp = async (req: Request, res: Response) => {
  try {
    const payload = createIcpSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const icp = await db.icp.create({
      data: {
        ...payload.data,
        userId: req.userId!,
      },
    });

    res.status(201).json(icp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create ICP" });
  }
};

export const getIcps = async (req: Request, res: Response) => {
  try {
    const icps = await db.icp.findMany({
      where: { userId: req.userId },
      include: {
        monitors: {
          include: {
            scrapeJobs: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    res.json(icps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ICPs" });
  }
};

export const getIcp = async (req: Request, res: Response) => {
  try {
    const idResult = icpIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid ICP id" });
    }

    const { id } = idResult.data;

    const icp = await db.icp.findUnique({
      where: { id },
      include: {
        monitors: {
          include: {
            scrapeJobs: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!icp) return res.status(404).json({ error: "ICP not found" });
    if (icp.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    res.json(icp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ICP" });
  }
};

export const updateIcp = async (req: Request, res: Response) => {
  try {
    const idResult = icpIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid ICP id" });
    }

    const payload = updateIcpSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { id } = idResult.data;

    const icp = await db.icp.findUnique({ where: { id } });

    if (!icp) return res.status(404).json({ error: "ICP not found" });
    if (icp.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    const updatedIcp = await db.icp.update({
      where: { id },
      data: {
        ...payload.data,
      },
    });

    res.json(updatedIcp);
  } catch (err) {
    res.status(500).json({ error: "Failed to update ICP" });
  }
};

export const deleteIcp = async (req: Request, res: Response) => {
  try {
    const idResult = icpIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid ICP id" });
    }

    const { id } = idResult.data;

    const icp = await db.icp.findUnique({ where: { id } });

    if (!icp) return res.status(404).json({ error: "ICP not found" });
    if (icp.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    await db.icp.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ICP" });
  }
};
