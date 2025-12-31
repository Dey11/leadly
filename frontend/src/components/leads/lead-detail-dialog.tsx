"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import { clientApi } from "@/lib/client/api";
import { formatDateTime } from "@/lib/format";
import type { LeadDetail, LeadStatus, LeadType } from "@/types/backend";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUS_STYLES, LEAD_TYPE_STYLES } from "@/constants/dashboard";

type LeadDetailDialogProps = {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (lead: { id: string; label: string }) => void;
  updatingLeadId: string | null;
  deletingLeadId: string | null;
};

const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Viewed", value: "VIEWED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function LeadDetailDialog({
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
              <Badge className={LEAD_TYPE_STYLES[lead.leadType]}>
                {lead.leadType}
              </Badge>
              <Badge className={LEAD_STATUS_STYLES[lead.status]}>
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
              onValueChange={(value) =>
                onStatusChange(lead.id, value as LeadStatus)
              }
              disabled={updatingLeadId === lead.id}
            >
              <SelectTrigger className="max-w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {leadStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
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
              onClick={() => onDelete({ id: lead.id, label: lead.content })}
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
