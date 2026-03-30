// Load env vars first
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { generateAndPublishSingleBlogNow } from "../seo/blog.processor";
import db from "../lib/db";

async function main() {
  console.log("Starting manual curated blog generation...");
  try {
    const post = await generateAndPublishSingleBlogNow();
    console.log("Blog post created successfully.");
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug}`);
    console.log("You can view it at: http://localhost:3000/blog/" + post.slug);
  } catch (error) {
    console.error("Failed to generate blog post:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
