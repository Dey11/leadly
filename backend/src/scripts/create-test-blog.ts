import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import db from "../lib/db";
import slugify from "slugify";

async function main() {
  console.log("🚀 Creating Test Blog Post...");

  const title = "The Ultimate Guide to AI Agents (Test Post)";
  const slug =
    slugify(title, { lower: true, strict: true }) + "-test-" + Date.now();

  const content = `
## Introduction
This is a **test blog post** to verify the rendering of *Markdown* features. We want to ensure that lists, headings, and formatting work correctly.

> "The future of AI is agentic." - Leadly

## Key Features of Agents
Here are some critical components:

### 1. Autonomy
Agents can work without constant supervision. They can:
- Plan tasks
- Execute improvements
- Self-correct

### 2. Tool Use
Agents use tools to interact with the world:
1. File system access
2. API calls
3. Browser automation

## Structuring Your Team
To build a successful agency, you need:
- **Project Manager**: Oversees the agents.
- **Developer**: Writes the code.
- **Designer**: ensure aesthetics.

## Table Test
| Role | Responsibility | Tools |
| :--- | :--- | :--- |
| Agent | Execution | CLI, API |
| Human | Supervision | Dashboard |

## Conclusion
This concludes the test post. If you see this formatted correctly, the update was successful.
`;

  try {
    const blogPost = await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: "This is a test post to verify markdown rendering.",
        coverImage:
          "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e",
        authorName: "Test Robot",
        authorRole: "QA",
        authorImage: "",
        tags: ["Test", "Markdown", "Engineering"],
        metaTitle: title,
        metaDescription: "Test blog post for verifying markdown rendering.",
        publishedAt: new Date(),
        status: "PUBLISHED",
        isAiGenerated: false,
        generationPrompt: "Manual Test Script",
      },
    });

    console.log("✅ Test Blog Post Created!");
    console.log(`Title: ${blogPost.title}`);
    console.log(`Slug: ${blogPost.slug}`);
    console.log(`Link: http://localhost:3000/blog/${blogPost.slug}`);
  } catch (error) {
    console.error("❌ Failed to create test blog post:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
