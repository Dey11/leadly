import { apiBaseUrl } from "../env";
import { toast } from "sonner";
import type {
  LeadDetailResponse,
  LeadListResponse,
  LeadStatus,
  LeadType,
} from "@/types/backend";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T = unknown>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await response.text();
  let payload: JsonValue | null = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text as JsonValue;
    }
  }

  if (!response.ok) {
    const message =
      (payload &&
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof (payload as Record<string, unknown>).error === "string" &&
        (payload as Record<string, string>).error) ||
      (typeof payload === "string" && payload.trim().length > 0
        ? payload
        : response.statusText || "Request failed");

    if (response.status === 429) {
      const retryAfter =
        payload &&
        typeof payload === "object" &&
        "retryAfter" in payload &&
        typeof (payload as Record<string, unknown>).retryAfter === "number"
          ? (payload as Record<string, number>).retryAfter
          : 60;
      toast.error("Rate limit exceeded", {
        description: `Please wait ${retryAfter} seconds before trying again.`,
        duration: 5000,
      });
    }

    throw new Error(message as string);
  }

  return (payload as T) ?? ({} as T);
}

export const clientApi = {
  login: (body: { email: string; password: string }) =>
    request<{ message?: string }>(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      body,
    }),
  register: (body: { name: string; email: string; password: string }) =>
    request<{ message?: string }>(`${apiBaseUrl}/auth/register`, {
      method: "POST",
      body,
    }),
  logout: () =>
    request<{ message?: string }>(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
    }),
  verifyEmail: (body: { email: string; otp: string }) =>
    request<{ message?: string }>(`${apiBaseUrl}/auth/verify-email`, {
      method: "POST",
      body,
    }),
  resendVerificationEmail: (body: { email: string }) =>
    request<{ message?: string }>(
      `${apiBaseUrl}/auth/resend-verification-email`,
      {
        method: "POST",
        body,
      },
    ),
  forgotPassword: (body: { email: string }) =>
    request<{ message?: string }>(`${apiBaseUrl}/auth/forgot-password`, {
      method: "POST",
      body,
    }),
  resetPassword: (body: { token: string; password: string }) =>
    request<{ message?: string }>(`${apiBaseUrl}/auth/reset-password`, {
      method: "POST",
      body,
    }),
  createIcp: (body: {
    name: string;
    summary: string;
    targetPersona: string;
    pains: string;
    valueProposition: string;
    qualifyingSignals: string;
    disqualifyingSignals: string;
    platform: string;
  }) => request(`${apiBaseUrl}/icps`, { method: "POST", body }),
  updateIcp: (
    icpId: string,
    body: Partial<{
      name: string;
      summary: string;
      targetPersona: string;
      pains: string;
      valueProposition: string;
      qualifyingSignals: string;
      disqualifyingSignals: string;
      platform: string;
      status: string;
    }>,
  ) =>
    request(`${apiBaseUrl}/icps/${icpId}`, {
      method: "PATCH",
      body,
    }),
  deleteIcp: (icpId: string) =>
    request(`${apiBaseUrl}/icps/${icpId}`, { method: "DELETE" }),
  createMonitor: (body: {
    icpId: string;
    target: string;
    platform: string;
    cursor?: string | null;
  }) => request(`${apiBaseUrl}/monitors`, { method: "POST", body }),
  updateMonitorStatus: (monitorId: string, status: string) =>
    request(`${apiBaseUrl}/monitors/${monitorId}`, {
      method: "PUT",
      body: { status },
    }),
  updateMonitor: (
    monitorId: string,
    body: Partial<{
      target: string;
      status: string;
      cursor: string | null;
      icpId: string;
      platform: string;
    }>,
  ) =>
    request(`${apiBaseUrl}/monitors/${monitorId}`, {
      method: "PUT",
      body,
    }),
  deleteMonitor: (monitorId: string) =>
    request(`${apiBaseUrl}/monitors/${monitorId}`, { method: "DELETE" }),
  updateSchedule: (body: { scheduledHours: number[] }) =>
    request(`${apiBaseUrl}/schedule`, { method: "PATCH", body }),
  updateAccount: (body: { name: string }) =>
    request(`${apiBaseUrl}/account`, { method: "PATCH", body }),
  deleteAccount: () => request(`${apiBaseUrl}/account`, { method: "DELETE" }),
  updateWalkthroughStatus: () =>
    request(`${apiBaseUrl}/account/walkthrough`, { method: "PATCH" }),
  suggestIcp: async (body: { description: string }) => {
    const response = await request<{
      message: string;
      payload: {
        name: string;
        summary: string;
        targetPersona: string;
        pains: string;
        valueProposition: string;
        qualifyingSignals: string;
        disqualifyingSignals: string;
      };
    }>(`${apiBaseUrl}/icps/ai/suggest`, { method: "POST", body });
    return response.payload;
  },
  suggestSubreddits: async (body: { icpId: string }) => {
    const response = await request<{ message: string; payload: string[] }>(
      `${apiBaseUrl}/monitors/ai/suggest-subreddits`,
      { method: "POST", body },
    );
    return response.payload;
  },

  // Billing
  subscribe: async (plan: "pro" | "premium") => {
    return request<{ url: string }>(`${apiBaseUrl}/billing/subscribe`, {
      method: "POST",
      body: { plan },
    });
  },
  openManageSubscription: async () => {
    return request<{ url: string }>(`${apiBaseUrl}/billing/portal/manage`, {
      method: "POST",
    });
  },
  openCancelSubscription: async () => {
    return request<{ url: string }>(`${apiBaseUrl}/billing/portal/cancel`, {
      method: "POST",
    });
  },
  previewPlanChange: async (plan: "pro" | "premium") => {
    return request<{
      canPreview: boolean;
      isNewSubscription: boolean;
      currentTier: string;
      newTier: string;
      isUpgrade?: boolean;
      immediateCharge?: {
        amount: number;
        currency: string;
        summary: string;
      } | null;
      credit?: { amount: number; currency: string } | null;
      summary?: string | null;
      fallback?: boolean;
      message?: string;
      error?: string;
      code?: string;
      retryAfterSeconds?: number;
    }>(`${apiBaseUrl}/billing/preview-plan-change`, {
      method: "POST",
      body: { plan },
    });
  },

  listLeads: async (
    params: {
      monitorId?: string;
      platform?: string;
      leadType?: LeadType;
      status?: LeadStatus;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const query = buildQueryString(params);
    const response = await request<LeadListResponse>(
      `${apiBaseUrl}/leads${query}`,
    );
    return response.payload;
  },
  getLead: async (leadId: string) => {
    const response = await request<LeadDetailResponse>(
      `${apiBaseUrl}/leads/${leadId}`,
    );
    return response.payload;
  },
  updateLeadStatus: (leadId: string, status: LeadStatus) =>
    request(`${apiBaseUrl}/leads/${leadId}`, {
      method: "PATCH",
      body: { status },
    }),
  deleteLead: (leadId: string) =>
    request(`${apiBaseUrl}/leads/${leadId}`, { method: "DELETE" }),

  // Bug Reports
  createBugReport: (body: {
    title: string;
    description: string;
    category: string;
    severity?: string;
    pageUrl?: string;
  }) =>
    request<{ message: string; payload: { id: string } }>(
      `${apiBaseUrl}/bug-reports`,
      {
        method: "POST",
        body,
      },
    ),

  // ==================== Keyword Sets ====================
  listKeywordSets: async () => {
    const response = await request<any[]>(`${apiBaseUrl}/keyword-sets`);
    return response;
  },
  createKeywordSet: (body: { name: string; keywords: string[] }) =>
    request(`${apiBaseUrl}/keyword-sets`, { method: "POST", body }),
  updateKeywordSet: (
    id: string,
    body: { name?: string; keywords?: string[] },
  ) => request(`${apiBaseUrl}/keyword-sets/${id}`, { method: "PATCH", body }),
  deleteKeywordSet: (id: string) =>
    request(`${apiBaseUrl}/keyword-sets/${id}`, { method: "DELETE" }),

  // ==================== Keyword Monitors ====================
  listKeywordMonitors: async () => {
    const response = await request<any[]>(`${apiBaseUrl}/keyword-monitors`);
    return response;
  },
  getKeywordMonitor: async (id: string) => {
    const response = await request<any>(`${apiBaseUrl}/keyword-monitors/${id}`);
    return response;
  },
  createKeywordMonitor: (body: {
    keywordSetId: string;
    target: string;
    platform?: string;
  }) => request(`${apiBaseUrl}/keyword-monitors`, { method: "POST", body }),
  updateKeywordMonitor: (
    id: string,
    body: { keywordSetId?: string; target?: string; status?: string },
  ) =>
    request(`${apiBaseUrl}/keyword-monitors/${id}`, { method: "PATCH", body }),
  deleteKeywordMonitor: (id: string) =>
    request(`${apiBaseUrl}/keyword-monitors/${id}`, { method: "DELETE" }),

  // ==================== Keyword Leads ====================
  listKeywordLeads: async (
    params: {
      keywordMonitorId?: string;
      platform?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const query = buildQueryString(params);
    const response = await request<{
      message: string;
      payload: {
        data: any[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(`${apiBaseUrl}/keyword-leads${query}`);
    return response.payload;
  },
  getKeywordLead: async (id: string) => {
    const response = await request<{ message: string; payload: any }>(
      `${apiBaseUrl}/keyword-leads/${id}`,
    );
    return response.payload;
  },
  updateKeywordLead: (id: string, status: LeadStatus) =>
    request(`${apiBaseUrl}/keyword-leads/${id}`, {
      method: "PATCH",
      body: { status },
    }),
  deleteKeywordLead: (id: string) =>
    request(`${apiBaseUrl}/keyword-leads/${id}`, { method: "DELETE" }),
  exportKeywordLeadsCsv: async (params: {
    keywordMonitorId?: string;
    status?: string;
    search?: string;
  }) => {
    const query = buildQueryString(params);
    const response = await fetch(`${apiBaseUrl}/keyword-leads/export${query}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Export failed");
    return response.blob();
  },

  // ==================== Keyword Schedule ====================
  getKeywordSchedule: async () => {
    const response = await request<any>(`${apiBaseUrl}/keyword-schedule`);
    return response;
  },
  updateKeywordSchedule: (body: { scheduledHours: number[] }) =>
    request(`${apiBaseUrl}/keyword-schedule`, { method: "PATCH", body }),

  // ==================== Keyword Stats ====================
  getKeywordStats: async () => {
    const response = await request<{ message: string; payload: any }>(
      `${apiBaseUrl}/keyword-stats`,
    );
    return response.payload;
  },
};
