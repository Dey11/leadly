import db from "../lib/db";

async function main() {
  const slug =
    "how-to-leverage-2024-conversational-marketing-trends-to-shorten-your-b2b-sales-cycle-and-scale-mrr-6555";
  try {
    const deleted = await db.blogPost.delete({
      where: { slug },
    });
    console.log(`Deleted post: ${deleted.title}`);
  } catch (error) {
    console.error("Error deleting post:", error);
  } finally {
    process.exit(0);
  }
}

main();
