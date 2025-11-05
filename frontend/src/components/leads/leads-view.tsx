"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
        setIsDetailOpen(false);
      }
      setDeleteTarget(null);
      setIsConfirmOpen(false);
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

  const handleDeleteLead = (lead: { id: string; label: string }) => {
    setDeleteTarget(lead);
    setIsConfirmOpen(true);
  };

  const confirmDeleteLead = () => {
    if (!deleteTarget) return;
    setDeletingLeadId(deleteTarget.id);
    deleteLeadMutation.mutate(deleteTarget.id);
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
      <section className="border-border/60 bg-card/80 rounded-3xl border p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold">Leads</h1>
            <p className="text-muted-foreground text-sm">
              Review, qualify, and manage outreach on every opportunity Leadly
              uncovers.
            </p>
          </div>
          <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:text-right">
            <span>Total leads: {pagination?.total ?? "–"}</span>
            <span>
              Showing {leadsQuery.data?.data.length ?? 0} of {filters.limit} per
              page
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
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
            <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
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
            <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
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
            <label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
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
                className="bg-muted/70 h-32 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="border-border/60 bg-card/80 text-muted-foreground rounded-2xl border p-10 text-center text-sm">
            No leads match your filters yet. Adjust the filters or check back
            after the next scrape.
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onViewDetail={() => {
                  setSelectedLeadId(lead.id);
                  setIsDetailOpen(true);
                }}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteLead}
                updating={updatingLeadId === lead.id}
                deleting={deletingLeadId === lead.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-border/60 bg-card/80 text-muted-foreground flex flex-col items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm md:flex-row">
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

      <LeadDetailDialog
        leadId={selectedLeadId}
        open={isDetailOpen && !!selectedLeadId}
        onOpenChange={(next) => {
          setIsDetailOpen(next);
          if (!next) {
            setSelectedLeadId(null);
          }
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteLead}
        updatingLeadId={updatingLeadId}
        deletingLeadId={deletingLeadId}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(next) => {
          setIsConfirmOpen(next);
          if (!next) {
            setDeleteTarget(null);
            setDeletingLeadId(null);
          }
        }}
        title="Delete this lead?"
        description={
          deleteTarget
            ? `This will remove "${deleteTarget.label}" from your workspace.`
            : "This will remove the lead from your workspace."
        }
        confirmLabel="Delete"
        tone="destructive"
        loading={!!deleteTarget && deletingLeadId === deleteTarget.id}
        onConfirm={confirmDeleteLead}
      />
    </div>
  );
}

type LeadCardProps = {
  lead: LeadSummary;
  onViewDetail: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (lead: { id: string; label: string }) => void;
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
    <div className="border-border/60 bg-card/80 hover:border-primary/40 rounded-2xl border p-5 shadow-sm transition">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge className={leadTypeStyles[lead.leadType]}>
            {lead.leadType}
          </Badge>
          <Badge className={leadStatusStyles[lead.status]}>{lead.status}</Badge>
        </div>
        <span className="text-muted-foreground text-xs">
          {formatRelative(lead.createdAt)}
        </span>
      </div>
      <p className="text-foreground mt-3 text-sm leading-relaxed">
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
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete({ id: lead.id, label: lead.content })}
          disabled={deleting}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

type LeadDetailDialogProps = {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (lead: { id: string; label: string }) => void;
  updatingLeadId: string | null;
  deletingLeadId: string | null;
};

function LeadDetailDialog({
  leadId,
  open,
  onOpenChange,
  onStatusChange,
  onDelete,
  updatingLeadId,
  deletingLeadId,
}: LeadDetailDialogProps) {
  const leadQuery = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => clientApi.getLead(leadId as string),
    enabled: open && !!leadId,
  });

  const hasMarkedViewed = useRef(false);

  useEffect(() => {
    if (!open) {
      hasMarkedViewed.current = false;
    }
  }, [open, leadId]);

  const lead = open ? (leadQuery.data as LeadDetail | undefined) : undefined;
  const isLoading = open && (leadQuery.isLoading || !leadQuery.data);

  useEffect(() => {
    if (!open) return;
    if (!lead || lead.status !== "NEW" || hasMarkedViewed.current) {
      return;
    }

    hasMarkedViewed.current = true;
    onStatusChange(lead.id, "VIEWED");
  }, [lead, onStatusChange, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0">
        <DialogHeader className="border-0 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold">
                Lead detail
              </DialogTitle>
              {lead ? (
                <DialogDescription className="flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:gap-2">
                  <span>Captured {formatDateTime(lead.createdAt)}</span>
                  {lead.author ? <span>· Posted by {lead.author}</span> : null}
                </DialogDescription>
              ) : (
                <DialogDescription>Loading lead details...</DialogDescription>
              )}
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <X className="size-4" aria-hidden />
              </Button>
            </DialogClose>
          </div>
          {lead ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className={leadTypeStyles[lead.leadType]}>
                {lead.leadType}
              </Badge>
              <Badge className={leadStatusStyles[lead.status]}>
                {lead.status}
              </Badge>
            </div>
          ) : null}
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
              Loading lead details...
            </div>
          ) : lead ? (
            <>
              <section className="space-y-2">
                <h3 className="text-foreground text-lg font-semibold">
                  Lead content
                </h3>
                <p className="border-border/60 bg-card/80 text-foreground rounded-2xl border p-4 text-sm leading-relaxed">
                  {lead.content}
                </p>
              </section>

              {lead.reasoning ? (
                <section className="space-y-2">
                  <h4 className="text-foreground text-sm font-semibold">
                    Why this matters
                  </h4>
                  <p className="border-border/40 bg-secondary/40 text-muted-foreground rounded-2xl border p-4 text-sm leading-relaxed">
                    {lead.reasoning}
                  </p>
                </section>
              ) : null}
            </>
          ) : (
            <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
              Unable to load lead details.
            </div>
          )}
        </div>

        {lead ? (
          <DialogFooter className="bg-card/90">
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
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() =>
                onDelete({ id: lead.id, label: lead.content })
              }
              disabled={deletingLeadId === lead.id}
            >
              {deletingLeadId === lead.id ? "Deleting..." : "Delete lead"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
