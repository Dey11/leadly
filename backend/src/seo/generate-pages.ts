import fs from "fs";
import path from "path";
import slugify from "slugify";
import { z } from "zod";
import { generateAIObject } from "../lib/ai";

const SOLUTIONS_PATH = path.join(
  __dirname,
  "../../../frontend/src/data/solutions.json",
);

const landingPageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  role: z.string(),
  pain_points: z.array(z.string()).length(3),
  value_props: z.array(z.string()).length(3),
  why_reddit: z.string(),
  cta: z.string(),
  image_keyword: z.string(),
});

const ROLES_TO_GENERATE = [
  // Real Estate & Home Services
  "Real Estate Agents",
  "Mortgage Brokers",
  "Interior Designers",
  "Plumbers",
  "Electricians",
  "Contractors",
  "Landscapers",
  "Moving Companies",

  // Professional Services
  "Lawyers",
  "Accountants",
  "Financial Advisors",
  "Tax Consultants",
  "Insurance Agents",
  "HR Consultants",
  "Recruitment Agencies",

  // Creative & Digital
  "Web Designers",
  "Graphic Designers",
  "Video Editors",
  "Copywriters",
  "SEO Agencies",
  "Social Media Managers",
  "Marketing Consultants",
  "GTM Teams",
  "Dev Shops",

  // Health & Wellness
  "Personal Trainers",
  "Nutritionists",
  "Dentists",
  "Chiropractors",
  "Therapists",
  "Life Coaches",

  // Tech / Startup
  "SaaS Founders",
  "Mobile App Developers",
  "Indie Hackers",
  "Growth Hackers",
  "Investor Relations Teams",

  // Events & Lifestyle
  "Wedding Planners",
  "Photographers",
  "Travel Agents",
  "Event Organizers",
];

async function generatePage(role: string) {
  try {
    console.log(`\nGenerating page for: ${role}...`);

    // 1. Check uniqueness (simple check to avoid expensive API call)
    let existingData: any[] = [];
    if (fs.existsSync(SOLUTIONS_PATH)) {
      existingData = JSON.parse(fs.readFileSync(SOLUTIONS_PATH, "utf-8"));

      // Basic pre-check: if a page with this ROLE exists, we might want to skip?
      // But the slug is generated, so we can't fully know.
      // However, we can check if "role" field matches anything?
      // The schema has "role": "${role}"
      // This saves the API call!
      const roleExists = existingData.find((p: any) => p.role === role);
      if (roleExists) {
        console.log(`Skipping ${role} (Found in existing data)`);
        return false;
      }
    }

    // Note: We don't know the exact slug yet, but we can guess.
    // Better to check AFTER generation or rely on unique content.
    // We will dedupe based on precise slug match later.

    const prompt = `
            Generate a single JSON object for a programmatic landing page targeting "${role}" for a product called "Leadly".
            Leadly is an AI tool that monitors Reddit for high-intent leads (people asking for help/recommendations) and drafts personalized replies.
            
            The JSON object MUST follow this schema exactly:
            {
            "slug": "string (kebab-case, e.g. lead-generation-for-real-estate-agents)",
            "title": "string (Catchy H1 - e.g. 'Find Real Estate Clients on Reddit')",
            "description": "string (H2/Subtext - Compelling value prop)",
            "role": "${role}",
            "pain_points": ["string", "string", "string"] (3 distinct pains relevant to ${role}),
            "value_props": ["string", "string", "string"] (3 distinct benefits of how Leadly helps ${role}),
            "why_reddit": "string (Why this specific audience hangs out on Reddit, mention specific subreddits if known)",
            "cta": "string (Short action-oriented CTA)",
            "image_keyword": "string (2-3 words for unsplash search, e.g. 'modern house interior' or 'law office')"
            }
            
        `;

    const { object: data } = await generateAIObject({
      prompt,
      schema: landingPageSchema,
    });

    // Sanitize Slug
    data.slug = slugify(data.title, { lower: true, strict: true });

    // Check duplication
    const exists = existingData.find((p: any) => p.slug === data.slug);
    if (exists) {
      console.log(`Skipping ${role} - Page already exists (${data.slug})`);
      return false;
    }

    // Add & Save
    existingData.push(data);
    fs.writeFileSync(SOLUTIONS_PATH, JSON.stringify(existingData, null, 2));

    console.log(`✅ Created: ${data.title}`);
    return true;
  } catch (e) {
    console.error(`❌ Failed for ${role}:`, e);
    return false;
  }
}

async function runBulkGeneration() {
  console.log(
    `Starting bulk generation for ${ROLES_TO_GENERATE.length} roles...`,
  );

  for (const role of ROLES_TO_GENERATE) {
    // If we made an API call (returned true), wait for rate limit
    // If false (skipped or failed), proceed immediately
    const madeApiCall = await generatePage(role);

    if (madeApiCall) {
      // Rate limit protection: 20 seconds for Gemini 3.0 Flash Preview
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }

  console.log("\n✅ Bulk generation complete!");
}

runBulkGeneration();
