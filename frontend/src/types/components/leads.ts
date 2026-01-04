import type { LeadType, LeadStatus, SubscriptionTier } from "@/types/backend";

export type FilterState = {
  monitorId: string;
  status: "" | LeadStatus;
  leadType: "" | LeadType;
  page: number;
  limit: number;
  search: string;
};

export type MonitorOption = {
  id: string;
  label: string;
};

export type LeadsViewProps = {
  monitors: MonitorOption[];
  tier: SubscriptionTier;
};
