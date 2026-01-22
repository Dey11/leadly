import type { Icp, LeadType } from "@prisma/client";
import { RedditPost } from "../types/reddit";
import { z } from "zod";
import { leadGenerationPrompt } from "../lib/prompts";
import { MIN_RELEVANCE_SCORE } from "../lib/constants";
import { generateObject } from "../lib/ai";

const VENDOR_PATTERNS = [
  /\bfor\s*hire\b/i,
  /\bhire\s*me\b/i,
  /\bavailable\s+for\s+work\b/i,
  /\bavailable\s+to\s+work\b/i,
  /\blooking\s+for\s+clients\b/i,
  /\bfreelance\s+(developer|engineer|designer)\b/i,
  /\bcontractor\s+available\b/i,
  /\bi\s+can\s+help\b/i,
];

function isVendorOffer(text: string) {
  return VENDOR_PATTERNS.some((pattern) => pattern.test(text));
}
export interface LeadData {
  platform: "REDDIT";
  leadType: LeadType;
  content: string;
  url: string;
  author?: string;
  reasoning: string;
}

function buildIcpBrief(
  icp: Pick<
    Icp,
    | "name"
    | "summary"
    | "targetPersona"
    | "pains"
    | "valueProposition"
    | "qualifyingSignals"
    | "disqualifyingSignals"
  >,
) {
  return [
    `Name: ${icp.name}`,
    `Summary: ${icp.summary}`,
    `Target persona: ${icp.targetPersona}`,
    `Pain points: ${icp.pains}`,
    `Value proposition: ${icp.valueProposition}`,
    `Qualifying signals: ${icp.qualifyingSignals}`,
    `Disqualifying signals: ${icp.disqualifyingSignals}`,
  ].join("\n");
}

export async function processLeads(
  posts: RedditPost[],
  icp: Pick<
    Icp,
    | "name"
    | "summary"
    | "targetPersona"
    | "pains"
    | "valueProposition"
    | "qualifyingSignals"
    | "disqualifyingSignals"
  >,
): Promise<LeadData[]> {
  const leads: LeadData[] = [];
  const icpBrief = buildIcpBrief(icp);

  for (const post of posts) {
    const { object: leadsArray } = await generateObject({
      temperature: 0.15,
      topP: 1,
      schema: z.array(
        z.object({
          title: z
            .string()
            .describe(
              "title of the post, or a matching title if the post is a comment",
            ),
          reasoning: z
            .string()
            .describe(
              "First, explain why this matches the lead description. Be specific.",
            ),
          leadType: z
            .enum(["WARM", "COLD", "NEUTRAL"])
            .describe("the type of lead based on the reasoning"),
          id: z.string().describe("Post ID of the post/comment"),
          url: z
            .string()
            .describe("URL to the post/comment. urlToPost/urlToComment"),
          author: z.string().describe("Author name/ID if available"),
          subreddit: z.string().describe("Subreddit name"),
          relevanceScore: z
            .number()
            .describe(
              "0-1 score. How well does the person/topic match the ICP? (High score = good fit, even if intent is low/neutral)",
            ),
        }),
      ),
      prompt: leadGenerationPrompt
        .replace("{icp_profile}", icpBrief)
        .replace("{post}", JSON.stringify(post)),
    });

    for (const lead of leadsArray) {
      const summaryText = `${lead.title} ${lead.reasoning}`.toLowerCase();
      if (isVendorOffer(summaryText)) {
        continue;
      }

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
