import { RedditPost, RedditComment } from "../types/reddit";

/**
 * Filters posts that contain ANY of the specified keywords
 * Searches in: title, post body, and comments (recursively)
 */
export function filterPostsByKeywords(
  posts: RedditPost[],
  keywords: string[]
): RedditPost[] {
  if (!keywords || keywords.length === 0) {
    return posts; // No keywords = return all posts
  }

  // Normalize keywords to lowercase for case-insensitive matching
  const normalizedKeywords = keywords.map((k) => k.toLowerCase().trim());

  return posts.filter((post) => {
    const searchableText = buildSearchableText(post).toLowerCase();
    return normalizedKeywords.some((keyword) =>
      searchableText.includes(keyword)
    );
  });
}

/**
 * Build a searchable string from post content (title, body, all comments)
 */
function buildSearchableText(post: RedditPost): string {
  const parts: string[] = [post.title, post.post];

  // Recursively extract comment text
  const extractCommentText = (comments: RedditComment[]): string[] => {
    if (!comments) return [];
    return comments.flatMap((c) => [
      c.commentText,
      ...extractCommentText(c.children),
    ]);
  };

  parts.push(...extractCommentText(post.comments));

  return parts.filter(Boolean).join(" ");
}

/**
 * Get which keywords matched in a post (for debugging/analytics)
 */
export function getMatchedKeywords(
  post: RedditPost,
  keywords: string[]
): string[] {
  const searchableText = buildSearchableText(post).toLowerCase();
  return keywords.filter((keyword) =>
    searchableText.includes(keyword.toLowerCase().trim())
  );
}

/**
 * Check if a post matches ANY of the keywords
 */
export function postMatchesKeywords(
  post: RedditPost,
  keywords: string[]
): boolean {
  if (!keywords || keywords.length === 0) return true;

  const searchableText = buildSearchableText(post).toLowerCase();
  return keywords.some((keyword) =>
    searchableText.includes(keyword.toLowerCase().trim())
  );
}
