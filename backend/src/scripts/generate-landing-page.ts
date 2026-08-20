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

async function generateLandingPage(role: string) {
  console.log(`Generating landing page for: ${role}...`);

  const prompt = `
    Generate a single JSON object for a landing page targeting "${role}" for a product called "Leadly".
    Leadly is an AI tool that monitors Reddit for leads (people asking for help) and drafts replies.
    
    The JSON object MUST follow this schema exactly:
    {
      "slug": "string (kebab-case, e.g. lead-generation-for-real-estate)",
      "title": "string (Catchy H1)",
      "description": "string (H2/Subtext)",
      "role": "${role}",
      "pain_points": ["string", "string", "string"] (3 distinct pains),
      "value_props": ["string", "string", "string"] (3 distinct benefits of Leadly),
      "why_reddit": "string (Why this audience hangs out on Reddit)",
      "cta": "string (Short CTA text)",
      "image_keyword": "string (2-3 words for unsplash search)"
    }
    
  `;

  try {
    const { object: data } = await generateAIObject({
      prompt,
      schema: landingPageSchema,
    });

    // Force strict slug
    data.slug = slugify(data.title, { lower: true, strict: true });

    // Read existing file
    let existingData = [];
    if (fs.existsSync(SOLUTIONS_PATH)) {
      const fileContent = fs.readFileSync(SOLUTIONS_PATH, "utf-8");
      existingData = JSON.parse(fileContent);
    }

    // Check for duplicates
    const exists = existingData.find((p: any) => p.slug === data.slug);
    if (exists) {
      console.log(`Page for ${data.slug} already exists. Skipping.`);
      return;
    }

    // Append and Save
    existingData.push(data);
    fs.writeFileSync(SOLUTIONS_PATH, JSON.stringify(existingData, null, 2));

    console.log(`Successfully created landing page: ${data.title}`);
    console.log(`Slug: ${data.slug}`);
  } catch (error) {
    console.error("Failed to generate page:", error);
  }
}

// CLI usage
const roleArg = process.argv[2];
if (roleArg) {
  generateLandingPage(roleArg);
} else {
  console.log("Usage: bun src/scripts/generate-landing-page.ts <Role Name>");
}
