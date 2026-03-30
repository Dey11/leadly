import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import db from "../lib/db";

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: bun run delete-blog <slug>");
    process.exit(1);
  }

  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) {
    console.error("Post not found:", slug);
    process.exit(1);
  }

  await db.blogPost.delete({ where: { slug } });
  console.log("Deleted:", post.title, "(" + slug + ")");
  await db.$disconnect();
}

main();
