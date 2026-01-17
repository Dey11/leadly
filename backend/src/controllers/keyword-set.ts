import { Request, Response } from "express";
import db from "../lib/db";
import {
  createKeywordSetSchema,
  keywordSetIdParamSchema,
  updateKeywordSetSchema,
} from "../types/keyword-set";

export async function createKeywordSet(req: Request, res: Response) {
  try {
    const payload = createKeywordSetSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const keywordSet = await db.keywordSet.create({
      data: {
        ...payload.data,
        userId: req.userId!,
      },
    });

    res.status(201).json(keywordSet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create KeywordSet" });
  }
};

export async function getKeywordSets(req: Request, res: Response) {
  try {
    const keywordSets = await db.keywordSet.findMany({
      where: { userId: req.userId },
      include: {
        monitors: {
          select: {
            id: true,
            target: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(keywordSets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch KeywordSets" });
  }
};

export async function getKeywordSet(req: Request, res: Response) {
  try {
    const idResult = keywordSetIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid KeywordSet id" });
    }

    const { id } = idResult.data;

    const keywordSet = await db.keywordSet.findUnique({
      where: { id },
      include: {
        monitors: {
          select: {
            id: true,
            target: true,
            status: true,
          },
        },
      },
    });

    if (!keywordSet)
      return res.status(404).json({ error: "KeywordSet not found" });
    if (keywordSet.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    res.json(keywordSet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch KeywordSet" });
  }
}

export async function updateKeywordSet(req: Request, res: Response) {
  try {
    const idResult = keywordSetIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid KeywordSet id" });
    }

    const payload = updateKeywordSetSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { id } = idResult.data;

    const keywordSet = await db.keywordSet.findUnique({ where: { id } });

    if (!keywordSet)
      return res.status(404).json({ error: "KeywordSet not found" });
    if (keywordSet.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    const updatedKeywordSet = await db.keywordSet.update({
      where: { id },
      data: {
        ...payload.data,
      },
    });

    res.json(updatedKeywordSet);
  } catch (err) {
    res.status(500).json({ error: "Failed to update KeywordSet" });
  }
}

export async function deleteKeywordSet(req: Request, res: Response) {
  try {
    const idResult = keywordSetIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid KeywordSet id" });
    }

    const { id } = idResult.data;

    const keywordSet = await db.keywordSet.findUnique({ where: { id } });

    if (!keywordSet)
      return res.status(404).json({ error: "KeywordSet not found" });
    if (keywordSet.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    await db.keywordSet.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete KeywordSet" });
  }
};
