import type { RedditTargetType } from "@prisma/client";
import type { RedditFetchTarget } from "../types/reddit";

/**
 * Parses a user-supplied Reddit custom feed (multireddit) reference into its
 * owner + name parts. Accepts:
 *  - A full feed URL, e.g. https://www.reddit.com/user/retardeyd/m/jobs_and_gigs/new/
 *  - The bare path form, e.g. user/retardeyd/m/jobs_and_gigs or u/retardeyd/m/jobs_and_gigs
 *  - The stored composite form, e.g. retardeyd/jobs_and_gigs
 *
 * Returns null if the input doesn't match any of the supported shapes.
 */
export function parseCustomFeedTarget(
  input: string,
): { owner: string; name: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const pathMatch = trimmed.match(/u(?:ser)?\/([^/?#]+)\/m\/([^/?#]+)/i);
  if (pathMatch) {
    return { owner: pathMatch[1], name: pathMatch[2] };
  }

  const parts = trimmed.replace(/^\/+|\/+$/g, "").split("/");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], name: parts[1] };
  }

  return null;
}

/**
 * Builds the descriptor `Reddit#fetchPosts` needs from a monitor's stored
 * `target`/`targetType` fields.
 */
export function buildRedditFetchTarget(
  targetType: RedditTargetType,
  target: string,
): RedditFetchTarget {
  if (targetType === "CUSTOM_FEED") {
    const [owner, name] = target.split("/");
    return { type: "CUSTOM_FEED", owner, name };
  }

  return { type: "SUBREDDIT", subreddit: target.replace("r/", "") };
}
