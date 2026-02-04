import { google } from "@ai-sdk/google";
import { generateText, generateObject } from "ai";
import db from "../lib/db";
import logger from "../lib/logger";
import slugify from "slugify";
import { BLOG_TOPICS, STOCK_IMAGES } from "./topics";
import { z } from "zod";

export async function generateDailyBlog() {
  logger.info("Starting daily blog generation with Vercel AI SDK...");

  try {
    // 1. Pick a topic
    const topicBase =
      BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];

    // 2. Research Phase & Content Plan
    const { object: plan } = await generateObject({
      model: google("gemini-3-flash-preview"),
      prompt: `You are an expert Content Strategist.
      Topic: "${topicBase}"
      Target Audience: B2B Founders, Agency Owners.
      
      Create a detailed outline for a high-converting blog post.
      - Title: Catchy, click-worthy (e.g. "10 Best...", "How to...").
      - Key Sections (H2).
      - Image Concepts: Describe 2 images needed.`,
      schema: z.object({
        title: z.string(),
        sections: z.array(z.string()),
        imageConcepts: z.array(z.string()),
      }),
    });

    const slug =
      slugify(plan.title, { lower: true, strict: true }) +
      "-" +
      Date.now().toString().slice(-4);

    // 3. Select Assets
    const shuffledImages = [...STOCK_IMAGES].sort(() => 0.5 - Math.random());
    const coverImage = shuffledImages[0];
    const image1 = shuffledImages[1];
    const image2 = shuffledImages[2];

    // 4. Generate Full Content
    const { text: content } = await generateText({
      model: google("gemini-3-flash-preview"),
      prompt: `You are a professional blog content writer.
      
**CRITICAL: Your response must be ONLY valid Markdown content. No preamble, no explanations, no "Here is the blog post" text. Start directly with the first heading.**

Write a high-quality, long-form blog post (2000+ words) based on this title: "${plan.title}".
      
Context:
- Audience: B2B SaaS Founders.
- Tone: Authoritative, "Lean Giant" philosophy, Agentic workflows.
- Year: 2026 (Always reference 2026 context).

Structure & Formatting:
- Use standard Markdown syntax.
- **NO H1** (Title is H1). 
- **Structure**:
  - **Introduction**: Start with "## Introduction" heading.
  - **Body**: Use ## for main sections and ### for subsections.
  - **Conclusion**: End with "## Conclusion" heading.
- **Formatting**:
  - Use **bold** for emphasis on key terms.
  - Use bullet points (-) and numbered lists (1.) frequently for readability.
  - Use blockquotes (>) for key insights or quotes.
- **TOC**: Do NOT generate a Table of Contents, we build it automatically.
- **Images**: 
  - Insert this image after the Introduction: ![${plan.imageConcepts[0]}](${image1})
  - Insert this image before the Conclusion: ![${plan.imageConcepts[1]}](${image2})

Sections to include:
${plan.sections.map((s: string) => `- ${s}`).join("\n")}

Make the content actionable with specific steps and examples.`,
    });

    // 5. Generate Meta
    const { object: meta } = await generateObject({
      model: google("gemini-3-flash-preview"),
      prompt: `Generate SEO metadata for blog "${plan.title}".
IMPORTANT: 
- metaDescription must be under 160 characters.
- excerpt must be under 200 characters.
Be concise.`,
      schema: z.object({
        metaDescription: z.string(),
        excerpt: z.string(),
        tags: z.array(z.string()).min(3).max(6),
      }),
    });

    // 6. Save
    const blogPost = await db.blogPost.create({
      data: {
        title: plan.title,
        slug,
        content,
        excerpt: meta.excerpt,
        coverImage,
        authorName: "Leadly AI",
        authorRole: "Automated Content Agent",
        authorImage: "",
        tags: meta.tags,
        metaTitle: plan.title,
        metaDescription: meta.metaDescription,
        publishedAt: new Date(),
        status: "PUBLISHED",
        isAiGenerated: true,
        generationPrompt: "Vercel AI SDK - Gemini 3 Flash",
      },
    });

    logger.info(
      `Successfully generated blog post: ${blogPost.title} (${blogPost.slug})`,
    );
    return blogPost;
  } catch (error) {
    logger.error("Error generating daily blog:", error);
    throw error;
  }
}
