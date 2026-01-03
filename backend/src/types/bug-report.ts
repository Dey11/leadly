import { z } from "zod/v4";

export const bugReportCategoryEnum = z.enum([
  "BUG",
  "FEATURE_REQUEST",
  "QUESTION",
  "OTHER",
]);

export const bugReportSeverityEnum = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const createBugReportSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be at most 2000 characters"),
    category: bugReportCategoryEnum,
    severity: bugReportSeverityEnum.optional(),
    pageUrl: z.string().url().optional().or(z.literal("")),
  })
  .strict();

export type CreateBugReportInput = z.infer<typeof createBugReportSchema>;
