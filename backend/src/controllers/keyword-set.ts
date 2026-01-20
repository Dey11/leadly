import { Request, Response } from "express";
import logger from "../lib/logger";
import db from "../lib/db";
import {
  createKeywordSetSchema,
  keywordSetIdParamSchema,
  updateKeywordSetSchema,
} from "../types/keyword-set";
import { TIER_LIMITS } from "../lib/constants";

/**
 * Normalize and deduplicate keywords (lowercase, trim, unique)
 */
function normalizeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  return keywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => {
      if (k === "" || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

export async function createKeywordSet(req: Request, res: Response) {
  try {
    const payload = createKeywordSetSchema.safeParse(req.body);

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

    // Check max keyword sets limit
    const currentCount = await db.keywordSet.count({
      where: { userId: req.userId! },
    });

    if (currentCount >= tierLimits.maxKeywordSets) {
      return res.status(400).json({
        error: `Keyword Set limit reached. Your ${tier} plan allows ${tierLimits.maxKeywordSets} keyword sets.`,
      });
    }

    // Check keywords per set limit
    if (payload.data.keywords.length > tierLimits.maxKeywordsPerSet) {
      return res.status(400).json({
        error: `Too many keywords. Your ${tier} plan allows ${tierLimits.maxKeywordsPerSet} keywords per set.`,
      });
    }

    // Normalize and deduplicate keywords
    const normalizedKeywords = normalizeKeywords(payload.data.keywords);

    // Ensure at least one valid keyword remains after normalization
    if (normalizedKeywords.length === 0) {
      return res.status(400).json({
        error:
          "At least one valid keyword is required (non-empty, non-whitespace).",
      });
    }

    const keywordSet = await db.keywordSet.create({
      data: {
        name: payload.data.name,
        keywords: normalizedKeywords,
        userId: req.userId!,
      },
    });

    res.status(201).json(keywordSet);
  } catch (err) {
    logger.error("Failed to create KeywordSet:", err);
    res.status(500).json({ error: "Failed to create KeywordSet" });
  }
}

export async function getKeywordSets(req: Request, res: Response) {
  try {
    const keywordSets = await db.keywordSet.findMany({
      where: { userId: req.userId },
      include: {
        keywordMonitors: {
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
    logger.error("Failed to fetch KeywordSets:", err);
    res.status(500).json({ error: "Failed to fetch KeywordSets" });
  }
}

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
        keywordMonitors: {
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
    logger.error("Failed to fetch KeywordSet:", err);
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

    const keywordSet = await db.keywordSet.findUnique({
      where: { id },
      include: {
        user: { include: { subscription: true } },
      },
    });

    if (!keywordSet)
      return res.status(404).json({ error: "KeywordSet not found" });
    if (keywordSet.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    // Check keywords per set limit if updating keywords
    if (payload.data.keywords) {
      const user = keywordSet.user;
      if (!user.subscription) {
        return res
          .status(400)
          .json({ error: "User has no active subscription" });
      }

      const tier = user.subscription.tier;
      const tierLimits = TIER_LIMITS[tier];

      if (payload.data.keywords.length > tierLimits.maxKeywordsPerSet) {
        return res.status(400).json({
          error: `Too many keywords. Your ${tier} plan allows ${tierLimits.maxKeywordsPerSet} keywords per set.`,
        });
      }
    }

    // Normalize keywords if provided
    const updateData: { name?: string; keywords?: string[] } = {};
    if (payload.data.name) {
      updateData.name = payload.data.name;
    }
    if (payload.data.keywords) {
      const normalizedKeywords = normalizeKeywords(payload.data.keywords);

      // Ensure at least one valid keyword remains after normalization
      if (normalizedKeywords.length === 0) {
        return res.status(400).json({
          error:
            "At least one valid keyword is required (non-empty, non-whitespace).",
        });
      }

      updateData.keywords = normalizedKeywords;
    }

    const updatedKeywordSet = await db.keywordSet.update({
      where: { id },
      data: updateData,
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
}
