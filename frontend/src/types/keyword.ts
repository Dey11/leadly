import type { Platform, MonitorStatus, LeadStatus, SubscriptionTier, PaginationMeta } from "./backend";

// ==================== Keyword Set ====================

export interface KeywordSet {
  id: string;
  userId: string;
  name: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  keywordMonitors?: KeywordMonitorSummary[];
}

export interface KeywordMonitorSummary {
  id: string;
  target: string;
  status: MonitorStatus;
}

// ==================== Keyword Monitor ====================

export interface KeywordMonitor {
  id: string;
  userId: string;
  keywordSetId: string;
  keywordSet: KeywordSet;
  platform: Platform;
  target: string;
  cursor: string | null;
  status: MonitorStatus;
  lastScrapedAt: string | null;
  createdAt: string;
  updatedAt: string;
  scrapeJobs: KeywordScrapeJob[];
}

export interface KeywordScrapeJob {
  id: string;
  keywordMonitorId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  matchCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ==================== Keyword Lead ====================

export interface KeywordLeadSummary {
  id: string;
  platform: Platform;
  content: string;
  url: string;
  author: string | null;
  matchedKeywords: string[];
  status: LeadStatus;
  createdAt: string;
}

export interface KeywordLeadDetail extends KeywordLeadSummary {}

// ==================== Keyword Stats ====================

export interface KeywordStats {
  keywordSetsCount: number;
  keywordMonitorsCount: number;
  activeMonitors: number;
  pausedMonitors: number;
  totalMatches: number;
  matchesLast7Days: number;
  recentActivity: KeywordRecentActivity[];
}

export interface KeywordRecentActivity {
  keywordMonitorId: string;
  target: string;
  keywordSetName: string;
  keywordSetId: string;
  lastScrapeJob: {
    id: string;
    status: string;
    matchCount: number;
    completedAt: string | null;
    createdAt: string;
  };
}

// ==================== Keyword Schedule ====================

export interface KeywordSchedule {
  id: string;
  userId: string;
  scheduledHours: number[];
  createdAt: string;
  updatedAt: string;
}

export interface KeywordScheduleLimitsResponse {
  tier: SubscriptionTier;
  limits: {
    keywordMonitors: number;
    maxKeywordSets: number;
    maxKeywordsPerSet: number;
    selectableHours: number;
  };
  currentSchedule: KeywordSchedule | null;
}

// ==================== API Response Types ====================

export interface KeywordLeadListResponse {
  message: string;
  payload: {
    data: KeywordLeadSummary[];
    pagination: PaginationMeta;
  };
}

export interface KeywordLeadDetailResponse {
  message: string;
  payload: KeywordLeadDetail;
}

export interface KeywordStatsResponse {
  message: string;
  payload: KeywordStats;
}
