import { Request, Response } from "express";
import { z } from "zod";
import { generateAIObject, handleAiError } from "../lib/ai";
import db from "../lib/db";

const requestSchema = z.object({
  keywordSetId: z.string().min(1),
});

const subredditsSchema = z.object({
  subreddits: z
    .array(z.string())
    .describe(
      "List of relevant subreddit names (e.g., 'r/SaaS', 'r/marketing')",
    ),
});

type SubredditsResult = z.infer<typeof subredditsSchema>;

const SYSTEM_PROMPT = `You are an expert at finding online communities where specific topics are discussed.

Your ONLY task is to suggest relevant subreddits based on a set of keywords.

## Input Format
You will receive a list of keywords or phrases.

## Output Requirements
Suggest 5-10 subreddits where these topics are actively discussed.

## Rules
1. Return subreddit names in format "r/SubredditName"
2. Focus on active, relevant communities
3. Include a mix of broad and niche subreddits
4. Only suggest real, existing subreddits`;

export async function suggestSubreddits(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parseResult = requestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(400)
        .json({ error: "Please provide a valid Keyword Set ID." });
    }

    const { keywordSetId } = parseResult.data;

    const keywordSet = await db.keywordSet.findUnique({
      where: { id: keywordSetId },
    });

    if (!keywordSet) {
      return res.status(404).json({ error: "Keyword Set not found." });
    }

    if (keywordSet.userId !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    const keywordsContext = `
Keyword Set Name: ${keywordSet.name}
Keywords: ${keywordSet.keywords.join(", ")}
`.trim();

    const { object: result } = await generateAIObject<SubredditsResult>({
      lite: true,
      temperature: 0.3,
      schema: subredditsSchema,
      system: SYSTEM_PROMPT,
      prompt: `Suggest relevant subreddits for these keywords:\n\n${keywordsContext}`,
    });

    return res.json({
      message: "Subreddits suggested successfully",
      payload: result.subreddits,
    });
  } catch (error: unknown) {
    const { status, body } = handleAiError(error, "suggest subreddits");
    return res.status(status).json(body);
  }
}
