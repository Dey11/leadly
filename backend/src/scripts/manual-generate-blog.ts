// Load env vars first
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { generateDailyBlog } from "../seo/blog.processor";
import db from "../lib/db";

async function main() {
  console.log("🚀 Starting Manual Blog Generation...");
  try {
    const post = await generateDailyBlog();
    console.log("✅ Blog Post Created Successfully!");
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug}`);
    console.log("-----------------------------------");
    console.log("You can view it at: http://localhost:3000/blog/" + post.slug);
  } catch (error) {
    console.error("❌ Failed to generate blog post:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
