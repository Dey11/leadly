import type { LeadStatus, LeadType, ScrapeJob } from "@/types/backend";

// Number formatting
export const numberFormatter = new Intl.NumberFormat("en-US");

// Lead type styles
export const LEAD_TYPE_STYLES: Record<LeadType, string> = {
  WARM: "border border-primary/30 bg-primary/12 text-primary",
  NEUTRAL: "border border-secondary/40 bg-secondary/40 text-foreground",
  COLD: "border border-muted/60 bg-muted text-muted-foreground",
};

export const LEAD_TYPE_BADGE_STYLES: Record<LeadType, string> = {
  WARM: "bg-primary/15 text-primary",
  NEUTRAL: "bg-secondary/40 text-foreground",
  COLD: "bg-linen/70 text-foreground",
};

// Lead status styles
export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "border border-primary/30 bg-primary/12 text-primary",
  VIEWED: "border border-secondary/40 bg-secondary/30 text-foreground",
  CONTACTED:
    "border border-[rgba(119,51,68,0.25)] bg-[rgba(119,51,68,0.12)] text-primary",
  ARCHIVED: "border border-muted/60 bg-muted text-muted-foreground",
};

// Lead progress bar styles
export const LEAD_PROGRESS_STYLES: Record<LeadType, string> = {
  WARM: "bg-primary",
  NEUTRAL: "bg-secondary-foreground/70",
  COLD: "bg-muted-foreground/70",
};

// Lead dot indicator styles
export const LEAD_DOT_STYLES: Record<LeadType, string> = {
  WARM: "bg-primary",
  NEUTRAL: "bg-secondary-foreground/70",
  COLD: "bg-muted-foreground/70",
};

// Job status styles
export const JOB_STATUS_STYLES: Record<ScrapeJob["status"], string> = {
  COMPLETED: "border border-primary/30 bg-primary/12 text-primary",
  RUNNING: "border border-secondary/40 bg-secondary/35 text-foreground",
  PENDING: "border border-muted/60 bg-muted text-muted-foreground",
  FAILED:
    "border border-[rgba(187,47,66,0.2)] bg-[rgba(187,47,66,0.1)] text-[#bb2f42]",
};

// Monitor status config
export const MONITOR_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "outline" | "success" | "warning" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  ARCHIVED: { label: "Archived", variant: "outline" },
};

// Prime time targets for schedule selection
export const PRIME_TIME_TARGETS = [10, 13, 18, 21];

// Skeleton constants
export const SKELETON_COUNTS = {
  STAT_CARDS: 4,
  TABLE_ROWS: 6,
  MONITOR_CARDS: 4,
  ICP_CARDS: 2,
  LEAD_ROWS: 5,
  SESSION_CARDS: 2,
} as const;
