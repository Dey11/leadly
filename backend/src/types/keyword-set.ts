import { z } from "zod";

export const createKeywordSetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  keywords: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one keyword is required")
    .max(50, "Maximum 50 keywords allowed"),
  isFuzzyMatch: z.boolean().optional(),
});

export const updateKeywordSetSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    keywords: z
      .array(z.string().min(1).max(50))
      .min(1, "At least one keyword is required")
      .max(50, "Maximum 50 keywords allowed")
      .optional(),
    isFuzzyMatch: z.boolean().optional(),
  })
  .refine(
    (data) => data.name || data.keywords || data.isFuzzyMatch !== undefined,
    {
      message: "At least one field must be provided to update the KeywordSet.",
    },
  );

export const keywordSetIdParamSchema = z.object({
  id: z.string().cuid(),
});
