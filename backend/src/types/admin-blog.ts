import { z } from "zod/v4";

export const blogPostStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// No .default() on these fields: the update schema reuses them via .partial(),
// and defaults must only apply on create, not silently overwrite existing
// values when a field is omitted from an update request.
const adminBlogPostFields = {
  title: z.string().min(1, "Title is required"),
  content: z.string().min(200, "Content must be at least 200 characters"),
  excerpt: z.string().min(1, "Excerpt is required"),
  slug: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  authorName: z.string().optional(),
  authorRole: z.string().optional(),
  authorImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  status: blogPostStatusEnum.optional(),
  publishedAt: z.iso.datetime().optional(),
  isAiGenerated: z.boolean().optional(),
  generationPrompt: z.string().optional(),
};

export const createAdminBlogPostSchema = z.object(adminBlogPostFields).strict();

export type CreateAdminBlogPostInput = z.infer<
  typeof createAdminBlogPostSchema
>;

export const updateAdminBlogPostSchema = z
  .object(adminBlogPostFields)
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update the post.",
  );

export type UpdateAdminBlogPostInput = z.infer<
  typeof updateAdminBlogPostSchema
>;

export const adminBlogSlugParamSchema = z
  .object({
    slug: z.string().min(1),
  })
  .strict();

export const listAdminBlogPostsQuerySchema = z
  .object({
    status: blogPostStatusEnum.optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
  })
  .strict();

export type ListAdminBlogPostsQuery = z.infer<
  typeof listAdminBlogPostsQuerySchema
>;
