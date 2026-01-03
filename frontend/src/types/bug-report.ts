export type BugReportCategory =
  | "BUG"
  | "FEATURE_REQUEST"
  | "QUESTION"
  | "OTHER";

export type BugReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type BugReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface CreateBugReportRequest {
  title: string;
  description: string;
  category: BugReportCategory;
  severity?: BugReportSeverity;
  pageUrl?: string;
}

export interface BugReportSummary {
  id: string;
  title: string;
  category: BugReportCategory;
  severity: BugReportSeverity | null;
  status: BugReportStatus;
  createdAt: string;
}

export interface CreateBugReportResponse {
  message: string;
  payload: {
    id: string;
    title: string;
    category: BugReportCategory;
    status: BugReportStatus;
    createdAt: string;
  };
}
