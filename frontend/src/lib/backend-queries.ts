import type {
  AccountResponse,
  Icp,
  LeadListResponse,
  Monitor,
  Schedule,
  ScheduleLimitsResponse,
  Session,
  UsageSummaryResponse,
} from "@/types/backend";
import { backendJson, BackendError } from "./api-client";

export async function getAccountSummary() {
  try {
    const response = await backendJson<AccountResponse>("/account");
    return response.payload.data;
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return null;
    }
    throw error;
  }
}

export async function getAccountSessions() {
  try {
    const response = await backendJson<{
      message: string;
      payload: Session[];
    }>("/account/sessions");
    return response.payload;
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return [];
    }
    throw error;
  }
}

export async function getIcps() {
  try {
    return await backendJson<Icp[]>("/icps");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return [];
    }
    throw error;
  }
}

export async function getIcpDetail(id: string) {
  return await backendJson<Icp>(`/icps/${id}`);
}

export async function getMonitors() {
  try {
    return await backendJson<Monitor[]>("/monitors");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return [];
    }
    throw error;
  }
}

export async function getSchedule() {
  try {
    return await backendJson<Schedule>("/schedule");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return null;
    }
    throw error;
  }
}

export async function getKeywordSchedule() {
  try {
    return await backendJson<Schedule>("/keyword-schedule");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429 || error.status === 404)
    ) {
      return null;
    }
    throw error;
  }
}

export async function getScheduleLimits() {
  try {
    return await backendJson<ScheduleLimitsResponse>("/schedule/limits");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return null;
    }
    throw error;
  }
}

export async function getUsageSummary() {
  try {
    return await backendJson<UsageSummaryResponse>("/account/usage");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return null;
    }
    throw error;
  }
}

export async function getLeads(
  params: {
    monitorId?: string;
    platform?: string;
    leadType?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  try {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      searchParams.set(key, String(value));
    });
    const query = searchParams.toString();
    const path = `/leads${query ? `?${query}` : ""}`;
    const response = await backendJson<LeadListResponse>(path);
    return response.payload;
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return null;
    }
    throw error;
  }
}

// Keyword mode queries
export async function getKeywordMonitors() {
  try {
    return await backendJson<any[]>("/keyword-monitors");
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429)
    ) {
      return [];
    }
    throw error;
  }
}

export interface RecentMatch {
  id: string;
  content: string;
  url: string;
  platform: string;
  status: string;
  matchedKeywords: string[];
  createdAt: string;
  target: string;
}

export interface KeywordStats {
  keywordSetsCount: number;
  keywordMonitorsCount: number;
  activeMonitors: number;
  pausedMonitors: number;
  totalMatches: number;
  matchesLast7Days: number;
  lastCompletedAt: string | null;
  lastJobMatches: number;
  recentActivity: Array<{
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
  }>;
  recentMatches: RecentMatch[];
}

export async function getKeywordStats() {
  try {
    const response = await backendJson<{
      message: string;
      payload: KeywordStats;
    }>("/keyword-stats");
    return response.payload;
  } catch (error) {
    if (
      error instanceof BackendError &&
      (error.status === 401 || error.status === 429 || error.status === 404)
    ) {
      return null;
    }
    throw error;
  }
}
