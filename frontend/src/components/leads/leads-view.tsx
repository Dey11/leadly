"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { toast } from "sonner";

import { clientApi } from "@/lib/client/api";
import type { LeadStatus } from "@/types/backend";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsFilterBar } from "@/components/leads/leads-filter-bar";
import { LeadDetailDialog } from "@/components/leads/lead-detail-dialog";
import { ExportCsvDialog } from "@/components/leads/export-csv-dialog";
import { DmBuilderDialog } from "@/components/leads/dm-builder-dialog";
import { DATA_REFRESH_INTERVAL } from "@/constants/config";
import type { LeadsViewProps, FilterState } from "@/types/components/leads";

export function LeadsView({ monitors, tier }: LeadsViewProps) {
  const queryClient = useQueryClient();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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
  const [dmDialogLead, setDmDialogLead] = useState<{
    id: string;
    author: string | null;
  } | null>(null);

  // Track previous total for new leads detection
  const prevTotalRef = useRef<number | null>(null);

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
    refetchInterval: DATA_REFRESH_INTERVAL,
  });

  // Show toast when new leads are detected
  useEffect(() => {
    const currentTotal = leadsQuery.data?.pagination?.total;
    if (currentTotal !== undefined && prevTotalRef.current !== null) {
      const newLeads = currentTotal - prevTotalRef.current;
      if (newLeads > 0 && filters.page === 1) {
        toast.success(
          newLeads === 1 ? "1 new lead found" : `${newLeads} new leads found`,
          { duration: 3000 },
        );
      }
    }
    if (currentTotal !== undefined) {
      prevTotalRef.current = currentTotal;
    }
  }, [leadsQuery.data?.pagination?.total, filters.page]);

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

  const handleGenerateDm = (leadId: string, author: string | null) => {
    setDmDialogLead({ id: leadId, author });
  };

  const leads = leadsQuery.data?.data ?? [];
  const pagination = leadsQuery.data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;
  const hasNextPage = filters.page < totalPages;
  const hasPreviousPage = filters.page > 1;

  return (
    <div className="flex flex-col gap-6">
      <LeadsFilterBar
        filters={filters}
        monitors={monitors}
        onFilterChange={(newFilters) => {
          resetFeedback();
          setFilters((prev) => ({ ...prev, ...newFilters }));
        }}
        tier={tier}
        hasLeads={leads.length > 0}
        onExport={() => setExportDialogOpen(true)}
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

      <section className="space-y-4" aria-label="Leads list">
        {leadsQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-muted/70 h-32 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <Card className="bg-muted/10 flex flex-col items-center justify-center border-2 border-dashed p-12">
            <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <SearchX className="text-muted-foreground/50 h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No leads found</h3>
            <p className="text-muted-foreground max-w-sm text-center">
              We couldn't find any leads matching your current filters.
              {filters.status || filters.leadType || filters.search
                ? " Try adjusting your filters."
                : " Waiting for the next scrape cycle."}
            </p>
          </Card>
        ) : (
          <LeadsTable
            leads={leads}
            onViewDetail={(leadId) => {
              setSelectedLeadId(leadId);
              setIsDetailOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteLead}
            onGenerateDm={handleGenerateDm}
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
            ? `This will remove "${deleteTarget.label}" from your workspace.`
            : "This will remove the lead from your workspace."
        }
        confirmLabel="Delete"
        tone="destructive"
        loading={!!deleteTarget && deletingLeadId === deleteTarget.id}
        onConfirm={confirmDeleteLead}
      />

      <ExportCsvDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        currentPage={filters.page}
        totalPages={totalPages}
        currentFilters={{
          monitorId: filters.monitorId || undefined,
          status: filters.status,
          leadType: filters.leadType,
        }}
      />

      <DmBuilderDialog
        leadId={dmDialogLead?.id ?? null}
        author={dmDialogLead?.author ?? null}
        open={!!dmDialogLead}
        onOpenChange={(open) => !open && setDmDialogLead(null)}
      />
    </div>
  );
}
