import { RedditPost, RedditComment } from "../types/reddit";

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check if a keyword matches as a whole word in the text
 */
function matchesWholeWord(text: string, keyword: string): boolean {
  // Use word boundary regex for whole word matching
  const escaped = escapeRegex(keyword.toLowerCase().trim());
  const pattern = new RegExp(`\\b${escaped}\\b`, "i");
  return pattern.test(text);
}

/**
 * Filters posts that contain ANY of the specified keywords (whole word match)
 * Searches in: title, post body, and comments (recursively)
 */
export function filterPostsByKeywords(
  posts: RedditPost[],
  keywords: string[],
): RedditPost[] {
  if (!keywords || keywords.length === 0) {
    return posts; // No keywords = return all posts
  }

  return posts.filter((post) => {
    const searchableText = buildSearchableText(post);
    return keywords.some((keyword) => matchesWholeWord(searchableText, keyword));
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
 * Get which keywords matched in a post (whole word match)
 */
export function getMatchedKeywords(
  post: RedditPost,
  keywords: string[],
): string[] {
  const searchableText = buildSearchableText(post);
  return keywords.filter((keyword) => matchesWholeWord(searchableText, keyword));
}

/**
 * Check if a post matches ANY of the keywords (whole word match)
 */
export function postMatchesKeywords(
  post: RedditPost,
  keywords: string[],
): boolean {
  if (!keywords || keywords.length === 0) return true;

  const searchableText = buildSearchableText(post);
  return keywords.some((keyword) => matchesWholeWord(searchableText, keyword));
}

