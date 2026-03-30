import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import slugify from "slugify";
import { z } from "zod";
import db from "../lib/db";
import logger from "../lib/logger";
import { BLOG_BRIEFS, BLOG_STOCK_IMAGES, type BlogBrief } from "./topics";

const BLOG_QUEUE_TARGET = 6;
const BLOG_INTERVAL_DAYS = 4;
const BLOG_AUTHOR_NAME = "Leadly Editorial";
const BLOG_AUTHOR_ROLE = "Reddit Demand Research";
const SITE_URL = "https://leadly.live";
const BLOG_MODEL = "gemini-3-flash-preview";

function isModelCapacityError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes("Quota exceeded") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("current quota") ||
    message.includes("experiencing high demand") ||
    message.includes("UNAVAILABLE")
  );
}

function pickImages(slug: string) {
  const hash = Array.from(slug).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const coverImage = BLOG_STOCK_IMAGES[hash % BLOG_STOCK_IMAGES.length];
  const image1 = BLOG_STOCK_IMAGES[(hash + 2) % BLOG_STOCK_IMAGES.length];
  const image2 = BLOG_STOCK_IMAGES[(hash + 4) % BLOG_STOCK_IMAGES.length];

  return { coverImage, image1, image2 };
}

async function getExistingBlogSlugs() {
  const posts = await db.blogPost.findMany({
    select: { slug: true },
  });
  return new Set(posts.map((post) => post.slug));
}

function getBriefBySlug(slug: string) {
  return BLOG_BRIEFS.find((brief) => brief.slug === slug);
}

async function chooseNextBrief() {
  const existingSlugs = await getExistingBlogSlugs();
  return BLOG_BRIEFS.find((brief) => !existingSlugs.has(brief.slug)) ?? null;
}

async function buildBlogPlan(brief: BlogBrief) {
  const { object } = await generateObject({
    model: google(BLOG_MODEL),
    prompt: `You are a B2B SaaS content strategist.

Produce a detailed blog plan for this brief:
- Title: ${brief.title}
- Primary keyword: ${brief.primaryKeyword}
- Audience: ${brief.audience}
- Angle: ${brief.angle}
- Required sections:
${brief.outline.map((item) => `- ${item}`).join("\n")}

Rules:
- Keep the piece commercial and product-adjacent.
- Use answer-first structure.
- Include one comparison table idea when relevant.
- Include a FAQ section.
- Do not mention unsupported channels unless the article is explicitly comparative.
`,
    schema: z.object({
      summary: z.string(),
      sections: z.array(z.string()).min(5).max(10),
      faqQuestions: z.array(z.string()).min(2).max(5),
    }),
  });

  return object;
}

async function buildBlogContent(
  brief: BlogBrief,
  plan: Awaited<ReturnType<typeof buildBlogPlan>>,
) {
  const { image1, image2 } = pickImages(brief.slug);

  const references = brief.sources
    .map((source) => `- ${source.label}: ${source.url}`)
    .join("\n");

  const links = brief.internalLinks
    .map((path) => `${SITE_URL}${path}`)
    .join("\n");

  const { text } = await generateText({
    model: google(BLOG_MODEL),
    prompt: `You are a senior content marketer writing for SaaS founders and agencies.

Write a long-form Markdown article.

Brief:
- Title: ${brief.title}
- Primary keyword: ${brief.primaryKeyword}
- Audience: ${brief.audience}
- Angle: ${brief.angle}
- Summary to deliver: ${plan.summary}

Mandatory structure:
- Start with "## Quick Answer"
- Follow with "## Why This Matters"
- Use the planned sections below as H2 sections
- Include one Markdown comparison table if relevant
- Include "## Frequently Asked Questions"
- Include "## Conclusion"
- Include "## Sources" at the end
- Do NOT include an H1

Planned sections:
${plan.sections.map((section) => `- ${section}`).join("\n")}

FAQ prompts:
${plan.faqQuestions.map((question) => `- ${question}`).join("\n")}

Internal links to work in naturally:
${links}

Reference sources you may cite:
${references}

Formatting and quality rules:
- Use only valid Markdown
- Use short paragraphs and direct answer-first writing
- Add specific numbers or facts only when grounded in the provided sources
- Do not invent product capabilities that Leadly does not have
- Do not use vague futurist language
- Keep the article highly relevant to Reddit-led pipeline generation
- Insert this image after the opening section: ![Product workflow visual](${image1})
- Insert this image before the FAQ section: ![Research and monitoring workflow](${image2})
- End the article with a soft CTA to try Leadly for free
`,
  });

  return text;
}

async function buildBlogMeta(brief: BlogBrief, content: string) {
  const { object } = await generateObject({
    model: google(BLOG_MODEL),
    prompt: `Generate SEO metadata for this blog.

Title: ${brief.title}
Primary keyword: ${brief.primaryKeyword}

Rules:
- metaDescription must be 140-160 characters
- excerpt must be under 190 characters
- tags should be practical and search-oriented
`,
    schema: z.object({
      metaDescription: z.string(),
      excerpt: z.string(),
      tags: z.array(z.string()).min(4).max(10),
    }),
  });

  return object;
}

export async function createBlogFromBrief(args: {
  brief: BlogBrief;
  scheduledFor: Date;
  status: "DRAFT" | "PUBLISHED";
}) {
  const { brief, scheduledFor, status } = args;
  const existing = await db.blogPost.findUnique({
    where: { slug: brief.slug },
  });

  if (existing) {
    logger.info(`Skipping blog brief ${brief.slug}; post already exists.`);
    return existing;
  }

  const plan = await buildBlogPlan(brief);
  const content = await buildBlogContent(brief, plan);
  const meta = await buildBlogMeta(brief, content);
  const { coverImage } = pickImages(brief.slug);

  return await db.blogPost.create({
    data: {
      slug: slugify(brief.slug, { lower: true, strict: true }),
      title: brief.title,
      content,
      excerpt: meta.excerpt,
      coverImage,
      authorName: BLOG_AUTHOR_NAME,
      authorRole: BLOG_AUTHOR_ROLE,
      authorImage: "",
      tags: meta.tags,
      metaTitle: brief.title,
      metaDescription: meta.metaDescription,
      publishedAt: scheduledFor,
      status,
      isAiGenerated: true,
      generationPrompt: `Curated GEO brief: ${brief.primaryKeyword}`,
    },
  });
}

export async function seedScheduledBlogBacklog(count = BLOG_QUEUE_TARGET) {
  const existingSlugs = await getExistingBlogSlugs();
  const scheduledCount = await db.blogPost.count({
    where: {
      status: "DRAFT",
      isAiGenerated: true,
    },
  });

  const needed = Math.max(0, count - scheduledCount);
  if (!needed) {
    logger.info("Scheduled blog backlog already healthy.");
    return [];
  }

  const availableBriefs = BLOG_BRIEFS.filter(
    (brief) => !existingSlugs.has(brief.slug),
  ).slice(0, needed);

  const existingLatest = await db.blogPost.findFirst({
    orderBy: { publishedAt: "desc" },
    select: { publishedAt: true },
  });

  let nextDate = existingLatest?.publishedAt ?? new Date();
  if (nextDate < new Date()) {
    nextDate = new Date();
  }

  const created = [];
  for (const brief of availableBriefs) {
    nextDate = new Date(
      nextDate.getTime() + BLOG_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
    );
    logger.info(`Generating scheduled blog backlog item: ${brief.slug}`);
    try {
      const post = await createBlogFromBrief({
        brief,
        scheduledFor: nextDate,
        status: "DRAFT",
      });
      created.push(post);
    } catch (error) {
      if (isModelCapacityError(error)) {
        logger.warn(
          `Stopping scheduled backlog generation early after ${created.length} item(s); model quota/capacity reached.`,
        );
        break;
      }

      throw error;
    }
  }

  return created;
}

export async function publishDueScheduledBlogs() {
  const duePosts = await db.blogPost.findMany({
    where: {
      status: "DRAFT",
      isAiGenerated: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: { publishedAt: "asc" },
  });

  if (duePosts.length === 0) {
    return [];
  }

  const updates = [];
  for (const post of duePosts) {
    updates.push(
      db.blogPost.update({
        where: { id: post.id },
        data: { status: "PUBLISHED" },
      }),
    );
  }

  logger.info(`Published ${duePosts.length} scheduled blog post(s).`);
  return await Promise.all(updates);
}

export async function generateDailyBlog() {
  await publishDueScheduledBlogs();
  const queued = await db.blogPost.count({
    where: {
      status: "DRAFT",
      isAiGenerated: true,
      publishedAt: { gt: new Date() },
    },
  });

  if (queued < BLOG_QUEUE_TARGET) {
    await seedScheduledBlogBacklog(BLOG_QUEUE_TARGET);
  }

  return await chooseNextBrief();
}

export async function generateAndPublishSingleBlogNow() {
  const brief = await chooseNextBrief();
  if (!brief) {
    throw new Error("No remaining curated blog briefs are available.");
  }

  return await createBlogFromBrief({
    brief,
    scheduledFor: new Date(),
    status: "PUBLISHED",
  });
}

export async function inspectBlogBacklog() {
  return await db.blogPost.findMany({
    where: { isAiGenerated: true },
    orderBy: { publishedAt: "asc" },
    select: {
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
    },
  });
}
