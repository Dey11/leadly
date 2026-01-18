import type { LeadStatus, SubscriptionTier } from "@/types/backend";

export type KeywordFilterState = {
  keywordMonitorId: string;
  status: "" | LeadStatus;
  page: number;
  limit: number;
  search: string;
};

export type KeywordMonitorOption = {
  id: string;
  label: string;
};

export type KeywordLeadsViewProps = {
  monitors: KeywordMonitorOption[];
  tier: SubscriptionTier;
};

export type KeywordSetsViewProps = {
  tier: SubscriptionTier;
};

export type KeywordMonitorsViewProps = {
  tier: SubscriptionTier;
};
