"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";

import { clientApi } from "@/lib/client/api";
import type { LeadStatus } from "@/types/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { formatRelative } from "@/lib/format";

interface KeywordLeadDetailDialogProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (lead: { id: string; label: string }) => void;
  updatingLeadId?: string | null;
  deletingLeadId?: string | null;
}

const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Viewed", value: "VIEWED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function KeywordLeadDetailDialog({
  leadId,
  open,
  onOpenChange,
  onStatusChange,
  onDelete,
  updatingLeadId,
  deletingLeadId,
}: KeywordLeadDetailDialogProps) {
  const leadQuery = useQuery({
    queryKey: ["keyword-lead", leadId],
    queryFn: () => (leadId ? clientApi.getKeywordLead(leadId) : null),
    enabled: !!leadId && open,
  });

  const lead = leadQuery.data;
  const isUpdating = updatingLeadId === leadId;
  const isDeleting = deletingLeadId === leadId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {leadQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : !lead ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Lead not found.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Keyword Match Details</DialogTitle>
              <DialogDescription>
                Posted {formatRelative(lead.createdAt)} by {lead.author || "Unknown"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-foreground leading-relaxed">{lead.content}</p>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold uppercase">
                  Matched Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {lead.matchedKeywords?.map((kw: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Status
                  </p>
                  <Select
                    value={lead.status}
                    onValueChange={(value) =>
                      onStatusChange(leadId!, value as LeadStatus)
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-semibold uppercase">
                    Platform
                  </p>
                  <Badge variant="outline">{lead.platform}</Badge>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" asChild>
                <a href={lead.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on {lead.platform}
                </a>
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  onDelete({ id: leadId!, label: lead.content.slice(0, 50) })
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
