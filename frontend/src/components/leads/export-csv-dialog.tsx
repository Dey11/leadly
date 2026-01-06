"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientApi } from "@/lib/client/api";
import type { LeadStatus, LeadType, LeadSummary } from "@/types/backend";
import { Download } from "lucide-react";

type PageRangeMode = "current" | "all" | "custom";

type ExportCsvDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPage: number;
  totalPages: number;
  currentFilters: {
    monitorId?: string;
    status?: LeadStatus | "";
    leadType?: LeadType | "";
  };
};

function escapeField(field: string): string {
  if (field.includes('"') || field.includes(",") || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function generateCsv(leads: LeadSummary[]): string {
  const headers = ["Type", "Status", "Content", "URL", "Author", "Created At"];
  const rows = leads.map((lead) => [
    lead.leadType,
    lead.status,
    escapeField(lead.content),
    lead.url,
    lead.author || "",
    new Date(lead.createdAt).toISOString(),
  ]);
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportCsvDialog({
  open,
  onOpenChange,
  currentPage,
  totalPages,
  currentFilters,
}: ExportCsvDialogProps) {
  const [pageRangeMode, setPageRangeMode] = useState<PageRangeMode>("all");
  const [customStart, setCustomStart] = useState(1);
  const [customEnd, setCustomEnd] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [leadTypeFilter, setLeadTypeFilter] = useState<LeadType | "all">("all");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPageRangeMode("all");
      setCustomStart(1);
      setCustomEnd(totalPages);
      setStatusFilter(currentFilters.status ? currentFilters.status : "all");
      setLeadTypeFilter(
        currentFilters.leadType ? currentFilters.leadType : "all",
      );
      setExporting(false);
      setProgress(0);
      setError(null);
    }
  }, [open, currentFilters, totalPages]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setProgress(0);

    try {
      let startPage: number;
      let endPage: number;

      if (pageRangeMode === "current") {
        startPage = currentPage;
        endPage = currentPage;
      } else if (pageRangeMode === "all") {
        startPage = 1;
        endPage = totalPages;
      } else {
        startPage = Math.max(1, Math.min(customStart, totalPages));
        endPage = Math.max(startPage, Math.min(customEnd, totalPages));
      }

      const allLeads: LeadSummary[] = [];
      const totalPagesToFetch = endPage - startPage + 1;

      for (let page = startPage; page <= endPage; page++) {
        const response = await clientApi.listLeads({
          monitorId: currentFilters.monitorId || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          leadType: leadTypeFilter === "all" ? undefined : leadTypeFilter,
          page,
          limit: 100,
        });

        allLeads.push(...response.data);
        setProgress(
          Math.round(((page - startPage + 1) / totalPagesToFetch) * 100),
        );
      }

      if (allLeads.length === 0) {
        setError("No leads found with the selected filters.");
        setExporting(false);
        return;
      }

      const csv = generateCsv(allLeads);
      const filename = `leads-${new Date().toISOString().split("T")[0]}.csv`;
      downloadCsv(csv, filename);

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export leads.");
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    if (!exporting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <Download className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Export Leads to CSV
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-sm">
                Select pages and filters for export
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Page Range</Label>
            <Select
              value={pageRangeMode}
              onValueChange={(value) =>
                setPageRangeMode(value as PageRangeMode)
              }
              disabled={exporting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">
                  Current page ({currentPage})
                </SelectItem>
                <SelectItem value="all">
                  All pages (1 - {totalPages})
                </SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pageRangeMode === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-muted-foreground text-xs">Start</Label>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={customStart}
                  onChange={(e) => setCustomStart(Number(e.target.value))}
                  disabled={exporting}
                />
              </div>
              <span className="text-muted-foreground mt-5">→</span>
              <div className="flex-1 space-y-1">
                <Label className="text-muted-foreground text-xs">End</Label>
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(Number(e.target.value))}
                  disabled={exporting}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status Filter</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as LeadStatus | "all")
              }
              disabled={exporting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="VIEWED">Viewed</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Lead Type Filter</Label>
            <Select
              value={leadTypeFilter}
              onValueChange={(value) =>
                setLeadTypeFilter(value as LeadType | "all")
              }
              disabled={exporting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="WARM">Warm</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
                <SelectItem value="COLD">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {exporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exporting...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="py-3">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            size="sm"
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting} size="sm">
            {exporting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Exporting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
