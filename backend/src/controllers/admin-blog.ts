import type { Request, Response } from "express";
import slugify from "slugify";
import db from "../lib/db";
import logger from "../lib/logger";
import {
  createAdminBlogPostSchema,
  updateAdminBlogPostSchema,
  listAdminBlogPostsQuerySchema,
  adminBlogSlugParamSchema,
} from "../types/admin-blog";

const SITE_URL = "https://leadly.live";

function canonicalPostUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}

function normalizeSlug(input: string) {
  return slugify(input, { lower: true, strict: true });
}

function writeSummary(post: {
  id: string;
  slug: string;
  status: string;
  publishedAt: Date | null;
}) {
  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    publishedAt: post.publishedAt,
    canonicalUrl: canonicalPostUrl(post.slug),
  };
}

function listSummary(post: {
  id: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: string[];
}) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    status: post.status,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    tags: post.tags,
  };
}

/**
 * POST /api/v1/admin/blog/posts
 * Create a new blog post. Requires admin API key.
 */
export async function createAdminBlogPost(req: Request, res: Response) {
  try {
    const parsed = createAdminBlogPostSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const slug = normalizeSlug(data.slug ?? data.title);

    if (!slug) {
      return res.status(400).json({ error: "Unable to derive a valid slug" });
    }

    const status = data.status ?? "PUBLISHED";
    const publishedAt =
      data.publishedAt !== undefined
        ? new Date(data.publishedAt)
        : status === "PUBLISHED"
          ? new Date()
          : null;

    const existing = await db.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return res.status(409).json({
        error: `A blog post with slug "${slug}" already exists`,
      });
    }

    const post = await db.blogPost.create({
      data: {
        slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags ?? [],
        coverImage: data.coverImage,
        authorName: data.authorName,
        authorRole: data.authorRole,
        authorImage: data.authorImage,
        metaTitle: data.metaTitle ?? data.title,
        metaDescription: data.metaDescription ?? data.excerpt,
        canonicalUrl: data.canonicalUrl,
        status,
        publishedAt,
        isAiGenerated: data.isAiGenerated ?? true,
        generationPrompt: data.generationPrompt,
      },
    });

    logger.info(
      `Admin created blog post "${post.slug}" (status=${post.status})`,
    );

    return res.status(201).json(writeSummary(post));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        error: "A blog post with that slug already exists",
      });
    }

    logger.error("Error creating admin blog post:", error);
    return res.status(500).json({ error: "Failed to create blog post" });
  }
}

/**
 * PUT /api/v1/admin/blog/posts/:slug
 * Update an existing blog post identified by its current slug. Requires admin API key.
 */
export async function updateAdminBlogPost(req: Request, res: Response) {
  try {
    const paramsResult = adminBlogSlugParamSchema.safeParse(req.params);

    if (!paramsResult.success) {
      return res.status(400).json({
        error: "Invalid slug parameter",
        details: paramsResult.error.flatten().fieldErrors,
      });
    }

    const currentSlug = paramsResult.data.slug;

    const parsed = updateAdminBlogPostSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    const existing = await db.blogPost.findUnique({
      where: { slug: currentSlug },
    });

    if (!existing) {
      return res.status(404).json({
        error: `No blog post found with slug "${currentSlug}"`,
      });
    }

    let nextSlug = existing.slug;
    if (data.slug !== undefined) {
      nextSlug = normalizeSlug(data.slug);

      if (!nextSlug) {
        return res.status(400).json({ error: "Unable to derive a valid slug" });
      }

      if (nextSlug !== existing.slug) {
        const slugConflict = await db.blogPost.findUnique({
          where: { slug: nextSlug },
          select: { id: true },
        });

        if (slugConflict) {
          return res.status(409).json({
            error: `A blog post with slug "${nextSlug}" already exists`,
          });
        }
      }
    }

    const nextStatus = data.status ?? existing.status;
    let nextPublishedAt = existing.publishedAt;
    if (data.publishedAt !== undefined) {
      nextPublishedAt = new Date(data.publishedAt);
    } else if (nextStatus === "PUBLISHED" && !nextPublishedAt) {
      nextPublishedAt = new Date();
    }

    const post = await db.blogPost.update({
      where: { id: existing.id },
      data: {
        slug: nextSlug,
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.authorName !== undefined && { authorName: data.authorName }),
        ...(data.authorRole !== undefined && { authorRole: data.authorRole }),
        ...(data.authorImage !== undefined && {
          authorImage: data.authorImage,
        }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && {
          metaDescription: data.metaDescription,
        }),
        ...(data.canonicalUrl !== undefined && {
          canonicalUrl: data.canonicalUrl,
        }),
        ...(data.isAiGenerated !== undefined && {
          isAiGenerated: data.isAiGenerated,
        }),
        ...(data.generationPrompt !== undefined && {
          generationPrompt: data.generationPrompt,
        }),
        status: nextStatus,
        publishedAt: nextPublishedAt,
      },
    });

    logger.info(
      `Admin updated blog post "${post.slug}" (status=${post.status})`,
    );

    return res.status(200).json(writeSummary(post));
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        error: "A blog post with that slug already exists",
      });
    }

    logger.error(`Error updating admin blog post ${req.params.slug}:`, error);
    return res.status(500).json({ error: "Failed to update blog post" });
  }
}

/**
 * GET /api/v1/admin/blog/posts
 * List blog posts including drafts and scheduled posts. Requires admin API key.
 */
export async function listAdminBlogPosts(req: Request, res: Response) {
  try {
    const parsed = listAdminBlogPostsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { status, limit } = parsed.data;

    const posts = await db.blogPost.findMany({
      where: status ? { status } : undefined,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        tags: true,
      },
    });

    return res.status(200).json({ posts: posts.map(listSummary) });
  } catch (error) {
    logger.error("Error listing admin blog posts:", error);
    return res.status(500).json({ error: "Failed to list blog posts" });
  }
}
