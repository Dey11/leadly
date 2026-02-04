import { Request, Response } from "express";
import { z } from "zod";
import { generateAIObject, handleAiError } from "../lib/ai";
import { AI_PROVIDER_ORDER_DM } from "../lib/constants";
import db from "../lib/db";
import logger from "../lib/logger";

const leadIdParamSchema = z.object({
  id: z.string().cuid(),
});

const dmResponseSchema = z.object({
  dm: z
    .string()
    .describe(
      "A personalized cold DM message for Reddit. Semi-professional tone, concise, max 500 chars.",
    ),
});

type DmResponse = z.infer<typeof dmResponseSchema>;

const SYSTEM_PROMPT = `You are a cold DM writing assistant for Reddit outreach.

Your task is to write a personalized, authentic cold DM based on a Reddit post, business context, and the user's writing style.

## TONE & STYLE
- Match the user's sample DM style if provided (see context)
- Casual and authentic (write like a normal Reddit user, not a salesperson)
- Genuine and helpful
- Reference the post naturally ("Saw your post about X", "Read your comment on Y")
- Keep it concise but natural
- End with a low-pressure question or soft call-to-action

## OUTPUT REQUIREMENTS
- Maximum 500 characters
- Do NOT include greetings like "Hi" or "Hey" at the start unless the sample DM uses them
- Do NOT include your name or signature unless the sample DM uses them
- Do NOT use emojis excessively
- Write as if you genuinely want to help them
- Include links/URLs ONLY if they are present in the user's sample DM. Copy the exact URL. Do NOT use placeholders like [Link].

## WHAT TO AVOID
- "Corporate speak", buzzwords, or marketing fluff
- Generic templates that could apply to anyone
- Mentioning that you're using AI or automation
- Being pushy or aggressive about selling
- Making assumptions about their specific situation beyond what's in the post

## CONTEXT PROVIDED
You'll receive:
1. The Reddit post content (what they wrote)
2. Business context (who you're targeting and what value you offer)
3. User profile (who you vary, your role, company)
4. Sample DM (example of your writing style)

Base your message ONLY on the provided information.`;

export async function generateDm(req: Request, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parseResult = leadIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid lead ID" });
    }

    const { id } = parseResult.data;

    // Fetch lead and user profile in parallel
    const [lead, user] = await Promise.all([
      db.lead.findFirst({
        where: {
          id,
          scrapeJob: {
            monitor: {
              userId,
            },
          },
        },
        select: {
          id: true,
          content: true,
          author: true,
          platform: true,
          generatedDm: true,
          scrapeJob: {
            select: {
              monitor: {
                select: {
                  icp: {
                    select: {
                      name: true,
                      summary: true,
                      targetPersona: true,
                      pains: true,
                      valueProposition: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      db.user.findUnique({
        where: { id: userId },
        select: {
          company: true,
          occupation: true,
          sampleDm: true,
        },
      }),
    ]);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Check if DM is already cached
    if (lead.generatedDm) {
      return res.json({
        message: "DM retrieved from cache",
        payload: {
          dm: lead.generatedDm,
          author: lead.author,
          cached: true,
        },
      });
    }

    const icp = lead.scrapeJob?.monitor?.icp;

    const prompt = buildDmPrompt(lead.content, lead.author, icp, user);

    if (!prompt) {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const { object: dmResult } = await generateAIObject<DmResponse>({
      lite: true,
      providerOrder: AI_PROVIDER_ORDER_DM,
      temperature: user?.sampleDm ? 0.8 : 0.7, // Slightly higher temp for style matching
      schema: dmResponseSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });

    // Save the generated DM to the database
    await db.lead.update({
      where: { id },
      data: { generatedDm: dmResult.dm },
    });

    return res.json({
      message: "DM generated successfully",
      payload: {
        dm: dmResult.dm,
        author: lead.author,
        cached: false,
      },
    });
  } catch (error: unknown) {
    logger.error("Failed to generate DM:", error);
    const { status, body } = handleAiError(error, "generate DM");
    return res.status(status).json(body);
  }
}

function buildDmPrompt(
  postContent: string,
  author: string | null,
  icp:
    | {
        name: string;
        summary: string;
        targetPersona: string;
        pains: string;
        valueProposition: string;
      }
    | null
    | undefined,
  user: {
    company: string | null;
    occupation: string | null;
    sampleDm: string | null;
  } | null,
): string {
  let prompt = `## REDDIT POST\n`;
  if (author) {
    prompt += `Author: u/${author}\n`;
  }
  prompt += `Content:\n${postContent.slice(0, 1500)}\n\n`;

  if (icp) {
    prompt += `## BUSINESS CONTEXT\n`;
    prompt += `Target: ${icp.targetPersona}\n`;
    prompt += `Their problems: ${icp.pains}\n`;
    prompt += `What you offer: ${icp.valueProposition}\n\n`;
  }

  if (user) {
    prompt += `## YOUR PROFILE\n`;
    if (user.company) prompt += `Company: ${user.company}\n`;
    if (user.occupation) prompt += `Role: ${user.occupation}\n`;

    if (user.sampleDm) {
      prompt += `\n## REFERENCE STYLE (SAMPLE DM)\n`;
      prompt += `Below is a sample DM written by the user. ADJUST YOUR WRITING STYLE AND TONE TO MATCH THIS EXAMPLE EXACTLY.\n`;
      prompt += `Sample:\n"${user.sampleDm}"\n`;
      prompt += `\nINSTRUCTION: Analyze the sample above. Is it casual? Direct? Detailed? Short? Mimic this style in your response.\n`;
      prompt += `MANDATORY: If the sample DM contains any URLs (e.g. portfolio, case studies), you MUST include them in your generated message. Copy the URL exactly as it appears in the sample. Do NOT omit it. Do NOT use [Link] placeholders.\n`;
    }
  }

  prompt += `\nWrite a personalized cold DM for this Reddit user based on their post, the business context, and your profile style.`;

  return prompt;
}
