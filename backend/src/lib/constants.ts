export const MIN_RELEVANCE_SCORE = 0.65;
export const MAX_SCRAPE_POSTS_LIMIT = 50;

export const DEFAULT_HOURS_MAP = {
  FREE: [12],
  PLUS: [4, 8, 12, 16, 20, 24],
  PRO: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
} as const;

export const TIER_LIMITS = {
  FREE: { monitors: 3, scrapesPerDay: 1, selectableHours: 1 },
  PLUS: { monitors: 6, scrapesPerDay: 6, selectableHours: 6 },
  PRO: { monitors: 24, scrapesPerDay: 24, selectableHours: 24 },
} as const;
