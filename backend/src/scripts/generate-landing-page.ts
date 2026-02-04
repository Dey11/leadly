import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import { env } from "../env"; // Ensure env is loaded or use dotenv directly if outside context

// Manually load dotenv if running as script
import dotenv from "dotenv";
dotenv.config();

const API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SOLUTIONS_PATH = path.join(
  __dirname,
  "../../../frontend/src/data/solutions.json",
);

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
    
    Return ONLY valid JSON. No markdown formatting.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const data = JSON.parse(text);

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
