import fs from "fs";
import path from "path";
import { z } from "zod";
import { generateAIObject } from "../lib/ai";

const SOLUTIONS_PATH = path.join(
  __dirname,
  "../../../frontend/src/data/solutions.json",
);

const enrichmentSchema = z.object({
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .length(3),
  use_cases: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .length(3),
});

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

      const { object: enriched } = await generateAIObject({
        prompt,
        schema: enrichmentSchema,
      });

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
