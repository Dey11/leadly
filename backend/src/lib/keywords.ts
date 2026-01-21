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
export function matchesWholeWord(text: string, keyword: string): boolean {
  // Use word boundary regex for whole word matching
  const escaped = escapeRegex(keyword.toLowerCase().trim());
  const pattern = new RegExp(`\\b${escaped}\\b`, "i");
  return pattern.test(text);
}


/**
 * Check if a keyword matches fuzzily (>= 50% of words present)
 */
export function matchesFuzzy(text: string, keyword: string): boolean {
  const keywordWords = keyword.toLowerCase().trim().split(/\s+/);
  if (keywordWords.length === 0) return false;

  // Count how many keyword words appear in the text as whole words
  let matchCount = 0;
  for (const word of keywordWords) {
    if (matchesWholeWord(text, word)) {
      matchCount++;
    }
  }

  // Calculate percentage
  const percentage = matchCount / keywordWords.length;
  // Match if >= 50%
  return percentage >= 0.5;
}

/**
 * Check if text matches a keyword based on strictness
 */
export function matchesKeyword(
  text: string,
  keyword: string,
  strict: boolean = true,
): boolean {
  return strict
    ? matchesWholeWord(text, keyword)
    : matchesFuzzy(text, keyword);
}

/**
 * Filters posts that contain ANY of the specified keywords
 * Searches in: title, post body, and comments (recursively)
 */
export function filterPostsByKeywords(
  posts: RedditPost[],
  keywords: string[],
  strict: boolean = true,
): RedditPost[] {
  if (!keywords || keywords.length === 0) {
    return []; // No keywords = no matches (don't match everything)
  }

  return posts.filter((post) => {
    const searchableText = buildSearchableText(post);
    return keywords.some((keyword) =>
      matchesKeyword(searchableText, keyword, strict),
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
 * Get which keywords matched in a post
 */
export function getMatchedKeywords(
  post: RedditPost,
  keywords: string[],
  strict: boolean = true,
): string[] {
  const searchableText = buildSearchableText(post);
  return keywords.filter((keyword) =>
    matchesKeyword(searchableText, keyword, strict),
  );
}

/**
 * Check if a post matches ANY of the keywords
 */
export function postMatchesKeywords(
  post: RedditPost,
  keywords: string[],
  strict: boolean = true,
): boolean {
  if (!keywords || keywords.length === 0) return false;

  const searchableText = buildSearchableText(post);
  return keywords.some((keyword) =>
    matchesKeyword(searchableText, keyword, strict),
  );
}

/**
 * Get the specific text snippet that triggered the match
 * Priorities: Title > Body > First Matching Comment
 */
export function getMatchingSnippet(
  post: RedditPost,
  keywords: string[],
  strict: boolean = true,
): { type: "title" | "body" | "comment"; text: string } | null {
  // 1. Check Title
  if (keywords.some((kw) => matchesKeyword(post.title, kw, strict))) {
    return { type: "title", text: post.title };
  }

  // 2. Check Body
  if (post.post && keywords.some((kw) => matchesKeyword(post.post, kw, strict))) {
    return { type: "body", text: post.post };
  }

  // 3. Check Comments (Recursively)
  const findInComments = (
    comments: RedditComment[],
  ): { type: "comment"; text: string } | null => {
    if (!comments) return null;
    for (const c of comments) {
      if (
        c.commentText &&
        keywords.some((kw) => matchesKeyword(c.commentText, kw, strict))
      ) {
        return { type: "comment", text: c.commentText };
      }
      const childMatch = findInComments(c.children);
      if (childMatch) return childMatch;
    }
    return null;
  };

  const commentMatch = findInComments(post.comments);
  if (commentMatch) {
    return { type: "comment", text: commentMatch.text };
  }

  return null;
}
