"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchX } from "lucide-react";

import { clientApi } from "@/lib/client/api";
import type { LeadStatus } from "@/types/backend";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { KeywordLeadsTable } from "./keyword-leads-table";
import { KeywordLeadsFilterBar } from "./keyword-leads-filter-bar";
import { KeywordLeadDetailDialog } from "./keyword-lead-detail-dialog";
import { DATA_REFRESH_INTERVAL } from "@/constants/config";
import type { KeywordLeadSummary } from "@/types/keyword";
import type {
  KeywordFilterState,
  KeywordMonitorOption,
} from "@/types/components/keyword";

interface KeywordLeadsViewProps {
  monitors: KeywordMonitorOption[];
  tier: string;
}

export function KeywordLeadsView({ monitors, tier }: KeywordLeadsViewProps) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<KeywordFilterState>({
    keywordMonitorId: "",
    status: "",
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
      "keyword-leads",
      filters.keywordMonitorId,
      filters.status,
      filters.page,
      filters.limit,
      filters.search,
    ],
    [
      filters.keywordMonitorId,
      filters.status,
      filters.page,
      filters.limit,
      filters.search,
    ],
  );

  const leadsQuery = useQuery({
    queryKey: leadsQueryKey,
    queryFn: async () => {
      const payload = await clientApi.listKeywordLeads({
        keywordMonitorId: filters.keywordMonitorId || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: filters.limit,
      });
      return payload;
    },
    refetchInterval: DATA_REFRESH_INTERVAL,
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      clientApi.updateKeywordLead(leadId, status),
    onSuccess: (_, { leadId, status }) => {
      queryClient.invalidateQueries({ queryKey: ["keyword-leads"] });
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
    mutationFn: (leadId: string) => clientApi.deleteKeywordLead(leadId),
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: ["keyword-leads"] });
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

  // Memoize handlers with useCallback per Rule 5.5
  const handleStatusChange = useCallback(
    (leadId: string, status: LeadStatus) => {
      setUpdatingLeadId(leadId);
      updateLeadMutation.mutate({ leadId, status });
    },
    [updateLeadMutation],
  );

  const handleDeleteLead = useCallback(
    (lead: { id: string; label: string }) => {
      setDeleteTarget(lead);
      setIsConfirmOpen(true);
    },
    [],
  );

  const confirmDeleteLead = useCallback(() => {
    if (!deleteTarget) return;
    setDeletingLeadId(deleteTarget.id);
    deleteLeadMutation.mutate(deleteTarget.id);
  }, [deleteTarget, deleteLeadMutation]);

  const resetFeedback = useCallback(() => {
    setFeedback(null);
    setErrorMessage(null);
  }, []);

  const leads = (leadsQuery.data?.data ?? []) as KeywordLeadSummary[];
  const pagination = leadsQuery.data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;
  const hasNextPage = filters.page < totalPages;
  const hasPreviousPage = filters.page > 1;

  return (
    <div className="flex flex-col gap-6">
      <KeywordLeadsFilterBar
        filters={filters}
        monitors={monitors}
        onFilterChange={(newFilters) => {
          resetFeedback();
          setFilters((prev) => ({ ...prev, ...newFilters }));
        }}
        tier={tier}
        hasLeads={leads.length > 0}
      />

      {feedback && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
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

      <section className="space-y-4" aria-label="Keyword leads list">
        {leadsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-muted/70 h-32 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : leadsQuery.isFetching ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="border-primary/30 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
            <p className="text-muted-foreground mt-4 text-sm">
              Loading leads...
            </p>
          </div>
        ) : leads.length === 0 ? (
          <Card className="bg-muted/10 flex flex-col items-center justify-center border-2 border-dashed p-12">
            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <SearchX className="text-muted-foreground/50 h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No leads found</h3>
            <p className="text-muted-foreground max-w-sm text-center">
              We couldn't find any keyword leads matching your current filters.
              {filters.status || filters.search
                ? " Try adjusting your filters."
                : " Waiting for the next scrape cycle."}
            </p>
          </Card>
        ) : (
          <KeywordLeadsTable
            leads={leads}
            onViewDetail={(leadId) => {
              setSelectedLeadId(leadId);
              setIsDetailOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteLead}
            updatingLeadId={updatingLeadId}
            deletingLeadId={deletingLeadId}
          />
        )}
      </section>

      <section
        className="border-border/60 bg-card/80 text-muted-foreground flex flex-col items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm md:flex-row"
        aria-label="Pagination"
      >
        <div>
          Page {filters.page} of {Math.max(1, totalPages)}
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

      <KeywordLeadDetailDialog
        leadId={selectedLeadId}
        open={isDetailOpen && !!selectedLeadId}
        onOpenChange={(next: boolean) => {
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
        onOpenChange={(next: boolean) => {
          setIsConfirmOpen(next);
          if (!next) {
            setDeleteTarget(null);
            setDeletingLeadId(null);
          }
        }}
        title="Delete this lead?"
        description={
          deleteTarget
            ? `This will remove this keyword match from your workspace.`
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
