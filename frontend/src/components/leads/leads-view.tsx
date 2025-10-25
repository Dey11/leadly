"use client";

import { useMemo, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { formatDateTime, formatRelative } from "@/lib/format";
import type {
  LeadDetail,
  LeadStatus,
  LeadSummary,
  LeadType,
} from "@/types/backend";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Viewed", value: "VIEWED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Archived", value: "ARCHIVED" },
];

const leadTypeStyles: Record<LeadType, string> = {
  WARM: "bg-primary/15 text-primary",
  NEUTRAL: "bg-secondary/40 text-foreground",
  COLD: "bg-linen/70 text-foreground",
};

const leadStatusStyles: Record<LeadStatus, string> = {
  NEW: "bg-primary/10 text-primary",
  VIEWED: "bg-secondary/40 text-foreground",
  CONTACTED: "bg-[rgba(119,51,68,0.14)] text-primary",
  ARCHIVED: "bg-muted text-muted-foreground",
};

type FilterState = {
  monitorId: string;
  status: "" | LeadStatus;
  leadType: "" | LeadType;
  page: number;
  limit: number;
  search: string;
};

type MonitorOption = {
  id: string;
  label: string;
};

type LeadsViewProps = {
  monitors: MonitorOption[];
};

export function LeadsView({ monitors }: LeadsViewProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterState>({
    monitorId: "",
    status: "",
    leadType: "",
    page: 1,
    limit: 20,
    search: "",
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const leadsQueryKey = useMemo(
    () => [
      "leads",
      filters.monitorId,
      filters.status,
      filters.leadType,
      filters.page,
      filters.limit,
      filters.search,
    ],
    [
      filters.monitorId,
      filters.status,
      filters.leadType,
      filters.page,
      filters.limit,
      filters.search,
    ],
  );

  const leadsQuery = useQuery({
    queryKey: leadsQueryKey,
    queryFn: async () => {
      const payload = await clientApi.listLeads({
        monitorId: filters.monitorId || undefined,
        status: filters.status || undefined,
        leadType: filters.leadType || undefined,
        page: filters.page,
        limit: filters.limit,
      });

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return {
          ...payload,
          data: payload.data.filter((lead) =>
            lead.content.toLowerCase().includes(searchLower),
          ),
        };
      }

      return payload;
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      clientApi.updateLeadStatus(leadId, status),
    onSuccess: (_, { leadId, status }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setFeedback(`Lead marked as ${status.toLowerCase()}.`);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update lead.",
      );
    },
    onSettled: () => {
      setUpdatingLeadId(null);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (leadId: string) => clientApi.deleteLead(leadId),
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setFeedback("Lead deleted successfully.");
      setErrorMessage(null);
      if (selectedLeadId === leadId) {
        setSelectedLeadId(null);
      }
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete lead.",
      );
    },
    onSettled: () => {
      setDeletingLeadId(null);
    },
  });

  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    setUpdatingLeadId(leadId);
    updateLeadMutation.mutate({ leadId, status });
  };

  const handleDeleteLead = (leadId: string) => {
    const confirmed = window.confirm(
      "Delete this lead? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingLeadId(leadId);
    deleteLeadMutation.mutate(leadId);
  };

  const resetFeedback = () => {
    setFeedback(null);
    setErrorMessage(null);
  };

  const leads = leadsQuery.data?.data ?? [];
  const pagination = leadsQuery.data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;
  const hasNextPage = filters.page < totalPages;
  const hasPreviousPage = filters.page > 1;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Leads</h1>
            <p className="text-sm text-muted-foreground">
              Review, qualify, and manage outreach on every opportunity Leadly
              uncovers.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:text-right">
            <span>Total leads: {pagination?.total ?? "–"}</span>
            <span>
              Showing {(leadsQuery.data?.data.length ?? 0)} of {filters.limit}
              
              per page
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Monitor
            </label>
            <Select
              value={filters.monitorId}
              onChange={(event) => {
                resetFeedback();
                setFilters((prev) => ({
                  ...prev,
                  monitorId: event.target.value,
                  page: 1,
                }));
              }}
            >
              <option value="">All monitors</option>
              {monitors.map((monitor) => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lead type
            </label>
            <Select
              value={filters.leadType}
              onChange={(event) => {
                resetFeedback();
                setFilters((prev) => ({
                  ...prev,
                  leadType: (event.target.value as LeadType) || "",
                  page: 1,
                }));
              }}
            >
              <option value="">All types</option>
              <option value="WARM">Warm</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="COLD">Cold</option>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status}
              onChange={(event) => {
                resetFeedback();
                setFilters((prev) => ({
                  ...prev,
                  status: (event.target.value as LeadStatus) || "",
                  page: 1,
                }));
              }}
            >
              <option value="">All statuses</option>
              {leadStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Search content
            </label>
            <Input
              placeholder="Filter by keywords"
              value={filters.search}
              onChange={(event) => {
                resetFeedback();
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                  page: 1,
                }));
              }}
            />
          </div>
        </div>
      </section>

      {feedback && (
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        {leadsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-muted/70"
              />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-10 text-center text-sm text-muted-foreground">
            No leads match your filters yet. Adjust the filters or check back
            after the next scrape.
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onViewDetail={() => setSelectedLeadId(lead.id)}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteLead}
                updating={updatingLeadId === lead.id}
                deleting={deletingLeadId === lead.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-muted-foreground md:flex-row">
        <div>
          Page {filters.page} of {totalPages}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetFeedback();
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
            }}
            disabled={!hasPreviousPage || leadsQuery.isFetching}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetFeedback();
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
            }}
            disabled={!hasNextPage || leadsQuery.isFetching}
          >
            Next
          </Button>
        </div>
      </section>

      <LeadDetailModal
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteLead}
        updatingLeadId={updatingLeadId}
        deletingLeadId={deletingLeadId}
      />
    </div>
  );
}

type LeadCardProps = {
  lead: LeadSummary;
  onViewDetail: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (leadId: string) => void;
  updating: boolean;
  deleting: boolean;
};

function LeadCard({
  lead,
  onViewDetail,
  onStatusChange,
  onDelete,
  updating,
  deleting,
}: LeadCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm transition hover:border-primary/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge className={leadTypeStyles[lead.leadType]}>{lead.leadType}</Badge>
          <Badge className={leadStatusStyles[lead.status]}>{lead.status}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatRelative(lead.createdAt)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {lead.content}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Select
          value={lead.status}
          className="max-w-[180px]"
          onChange={(event) =>
            onStatusChange(lead.id, event.target.value as LeadStatus)
          }
          disabled={updating}
        >
          {leadStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" onClick={onViewDetail}>
          View details
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(lead.id)}
          disabled={deleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

type LeadDetailModalProps = {
  leadId: string | null;
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (leadId: string) => void;
  updatingLeadId: string | null;
  deletingLeadId: string | null;
};

function LeadDetailModal({
  leadId,
  onClose,
  onStatusChange,
  onDelete,
  updatingLeadId,
  deletingLeadId,
}: LeadDetailModalProps) {
  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => clientApi.getLead(leadId as string),
    enabled: !!leadId,
  });

  if (!leadId) {
    return null;
  }

  const isLoading = leadQuery.isLoading || !leadQuery.data;
  const lead = leadQuery.data as LeadDetail | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border/70 bg-background p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
        {isLoading || !lead ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Loading lead details...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge className={leadTypeStyles[lead.leadType]}>
                  {lead.leadType}
                </Badge>
                <Badge className={leadStatusStyles[lead.status]}>
                  {lead.status}
                </Badge>
              </div>
              <div className="flex flex-col items-end text-xs text-muted-foreground">
                <span>{formatDateTime(lead.createdAt)}</span>
                {lead.author && <span>Posted by {lead.author}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Lead content</h3>
              <p className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm leading-relaxed text-foreground">
                {lead.content}
              </p>
            </div>

            {lead.reasoning && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Why this matters</h4>
                <p className="rounded-2xl border border-border/40 bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
                  {lead.reasoning}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Select
                value={lead.status}
                className="max-w-[200px]"
                onChange={(event) =>
                  onStatusChange(lead.id, event.target.value as LeadStatus)
                }
                disabled={updatingLeadId === lead.id}
              >
                {leadStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <a href={lead.url} target="_blank" rel="noopener noreferrer">
                  Open source
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(lead.id)}
                disabled={deletingLeadId === lead.id}
              >
                Delete lead
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
