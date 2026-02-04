import express from "express";
import db from "../lib/db";
import logger from "../lib/logger";

export const blogRouter = express.Router();

// Get all published blog posts
blogRouter.get("/posts", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const status = req.query.status as string;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const posts = await db.blogPost.findMany({
      where: whereClause,
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true,
        coverImage: true,
        authorName: true,
        authorRole: true,
        authorImage: true,
        tags: true,
      },
    });

    res.json({ posts });
  } catch (error) {
    logger.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

// Get single blog post by slug
blogRouter.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await db.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json(post);
  } catch (error) {
    logger.error(`Error fetching blog post ${req.params.slug}:`, error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});
