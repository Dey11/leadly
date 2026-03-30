import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import db from "../lib/db";
import { inspectBlogBacklog, seedScheduledBlogBacklog } from "../seo/blog.processor";

async function main() {
  const count = Number(process.argv[2] ?? "6");
  try {
    const created = await seedScheduledBlogBacklog(count);
    const backlog = await inspectBlogBacklog();

    console.log(`Created ${created.length} scheduled blog post(s).`);
    backlog.forEach((post) => {
      console.log(
        `${post.status.padEnd(9)} ${post.publishedAt?.toISOString() ?? "no-date"} ${post.slug}`,
      );
    });
  } catch (error) {
    console.error("Failed to generate blog backlog:", error);
    process.exitCode = 1;
  } finally {
    await db.$disconnect();
  }
}

main();
