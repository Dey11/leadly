export type Platform = "REDDIT";

export type MonitorStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
}

export interface AccountSummary {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
}

export interface AccountResponse {
  message: string;
  payload: {
    data: AccountSummary;
  };
}

export interface Icp {
  id: string;
  userId: string;
  name: string;
  summary: string;
  targetPersona: string;
  pains: string;
  valueProposition: string;
  qualifyingSignals: string;
  disqualifyingSignals: string;
  platform: Platform;
  status: MonitorStatus;
  createdAt: string;
  updatedAt: string;
  monitors: Monitor[];
}

export interface Monitor {
  id: string;
  userId: string;
  icpId: string;
  platform: Platform;
  target: string;
  cursor: string | null;
  status: MonitorStatus;
  lastScrapedAt: string | null;
  createdAt: string;
  updatedAt: string;
  icp?: Icp;
  scrapeJobs: ScrapeJob[];
}

export interface ScrapeJob {
  id: string;
  monitorId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  warmLeads: number;
  coldLeads: number;
  neutralLeads: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  leads?: LeadSummary[];
}

export type LeadStatus = "NEW" | "VIEWED" | "CONTACTED" | "ARCHIVED";

export type LeadType = "WARM" | "COLD" | "NEUTRAL";

export interface LeadSummary {
  id: string;
  platform: Platform;
  leadType: LeadType;
  content: string;
  url: string;
  author: string | null;
  status: LeadStatus;
  createdAt: string;
}

export interface LeadDetail extends LeadSummary {
  reasoning: string | null;
}

export interface Schedule {
  id: string;
  userId: string;
  scheduledHours: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleLimitsResponse {
  tier: SubscriptionTier;
  limits: {
    monitors: number;
    scrapesPerDay: number;
    selectableHours: number;
    monthlyScrapeLimit: number;
  };
  currentSchedule: Schedule | null;
}

export interface UsageSummaryResponse {
  message: string;
  payload: {
    tier: SubscriptionTier;
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
    periodStart: string;
    periodEnd: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadListResponse {
  message: string;
  payload: {
    data: LeadSummary[];
    pagination: PaginationMeta;
  };
}

export interface LeadDetailResponse {
  message: string;
  payload: LeadDetail;
}

export interface LeadUpdateResponse {
  message: string;
  payload: {
    id: string;
    status: LeadStatus;
  };
}

export type SubscriptionTier = "FREE" | "PRO" | "PREMIUM";
