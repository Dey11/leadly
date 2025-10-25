import type { LeadType } from "@prisma/client";
import { google } from "@ai-sdk/google";
import { RedditPost } from "../types/reddit";
import { generateObject } from "ai";
import { z } from "zod";
import { leadGenerationPrompt } from "../lib/prompts";
import { MIN_RELEVANCE_SCORE } from "../lib/constants";

export interface LeadData {
  platform: "REDDIT";
  leadType: LeadType;
  content: string;
  url: string;
  author?: string;
  reasoning: string;
}

const model = google("gemini-2.5-flash-lite");

export async function processLeads(
  posts: RedditPost[],
  leadDescription: string
): Promise<LeadData[]> {
  const leads: LeadData[] = [];

  for (const post of posts) {
    const { object: leadsArray } = await generateObject({
      model,
      schema: z.array(
        z.object({
          title: z
            .string()
            .describe(
              "title of the post, or a matching title if the post is a comment"
            ),
          leadType: z
            .enum(["WARM", "COLD", "NEUTRAL"])
            .describe("the type of lead"),
          reasoning: z
            .string()
            .describe("explain briefly why this matches the lead description"),
          id: z.string().describe("Post ID of the post/comment"),
          url: z.string().describe("URL to the post/comment"),
          author: z.string().describe("Author name/ID if available"),
          subreddit: z.string().describe("Subreddit name"),
          relevanceScore: z
            .number()
            .describe("0-1 (how confident you are in the match)"),
        })
      ),
      prompt: leadGenerationPrompt
        .replace("{lead_description}", leadDescription)
        .replace("{post}", JSON.stringify(post)),
    });

    for (const lead of leadsArray) {
      lead.relevanceScore >= MIN_RELEVANCE_SCORE &&
        leads.push({
          platform: "REDDIT",
          leadType: lead.leadType,
          content: lead.title,
          url: lead.url,
          author: lead.author,
          reasoning: lead.reasoning,
        });
    }
  }

  return leads;
}
