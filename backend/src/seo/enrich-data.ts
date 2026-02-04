import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { env } from "../env";
import dotenv from "dotenv";

dotenv.config();

const API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const SOLUTIONS_PATH = path.join(
  __dirname,
  "../../../frontend/src/data/solutions.json",
);

async function generateWithRetry(
  prompt: string,
  retries = 5,
  delay = 5000,
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      if (
        (error.status === 503 || error.message.includes("Overloaded")) &&
        i < retries - 1
      ) {
        console.warn(
          `Model overloaded. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries reached");
}

async function enrichData() {
  if (!fs.existsSync(SOLUTIONS_PATH)) {
    console.error("Solutions file not found!");
    return;
  }

  const data = JSON.parse(fs.readFileSync(SOLUTIONS_PATH, "utf-8"));
  let updatedCount = 0;

  console.log(`Enriching ${data.length} roles with FAQs and Use Cases...`);

  for (let i = 0; i < data.length; i++) {
    const page = data[i];

    // Skip if already enriched (check for faqs)
    if (page.faqs && page.faqs.length > 0) {
      console.log(`Skipping ${page.role} - Already enriched.`);
      continue;
    }

    console.log(`Generating content for: ${page.role}...`);

    try {
      const prompt = `
        You are an SEO expert for "Leadly", an AI tool that monitors Reddit for leads.
        Generate specific content for a landing page targeting: "${page.role}".
        
        Current context:
        Title: ${page.title}
        Pain Points: ${page.pain_points.join(", ")}

        Return a JSON object with EXACTLY this schema:
        {
          "faqs": [
            { "question": "Question 1 relevant to ${page.role}?", "answer": "Answer 1" },
            { "question": "Question 2 relevant to ${page.role}?", "answer": "Answer 2" },
            { "question": "Question 3 relevant to ${page.role}?", "answer": "Answer 3" }
          ],
          "use_cases": [
            { "title": "Use Case 1", "description": "Specific scenario for ${page.role}" },
            { "title": "Use Case 2", "description": "Specific scenario for ${page.role}" },
            { "title": "Use Case 3", "description": "Specific scenario for ${page.role}" }
          ]
        }
        
        Make sure the FAQs address specific concerns a "${page.role}" might have about using AI or Reddit for lead gen.
        Make sure Use Cases are concrete examples.
      `;

      const text = await generateWithRetry(prompt);
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const enriched = JSON.parse(cleanedText);

      // Updates
      data[i] = { ...page, ...enriched };
      updatedCount++;

      // Save periodically or after each to avoid losing progress
      fs.writeFileSync(SOLUTIONS_PATH, JSON.stringify(data, null, 2));

      // Rate limit safety
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {
      console.error(`Failed to enrich ${page.role}:`, e);
    }
  }

  console.log(`\n✅ Enrichment complete. Updated ${updatedCount} roles.`);
}

enrichData();
