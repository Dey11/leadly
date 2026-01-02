"use client";

import { Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LeadStatus, LeadType, SubscriptionTier } from "@/types/backend";
import type { FilterState, MonitorOption } from "@/types/components/leads";

interface LeadsFilterBarProps {
  filters: FilterState;
  monitors: MonitorOption[];
  onFilterChange: (filters: Partial<FilterState>) => void;
  tier: SubscriptionTier;
  hasLeads: boolean;
  isExporting: boolean;
  onExport: () => void;
  exportError: string | null;
}

const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Viewed", value: "VIEWED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function LeadsFilterBar({
  filters,
  monitors,
  onFilterChange,
  tier,
  hasLeads,
  isExporting,
  onExport,
  exportError,
}: LeadsFilterBarProps) {
  return (
    <div className="border-border/60 bg-card/80 rounded-3xl border p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm">
            Review, qualify, and manage outreach on every opportunity Leadly
            uncovers.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Monitor
          </Label>
          <Select
            value={filters.monitorId || "all"}
            onValueChange={(value) => {
              onFilterChange({
                monitorId: value === "all" ? "" : value,
                page: 1,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All monitors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All monitors</SelectItem>
              {monitors.map((monitor) => (
                <SelectItem key={monitor.id} value={monitor.id}>
                  {monitor.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Lead type
          </Label>
          <Select
            value={filters.leadType || "all"}
            onValueChange={(value) => {
              onFilterChange({
                leadType: (value === "all" ? "" : value) as LeadType | "",
                page: 1,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="WARM">Warm</SelectItem>
              <SelectItem value="NEUTRAL">Neutral</SelectItem>
              <SelectItem value="COLD">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Status
          </Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => {
              onFilterChange({
                status: (value === "all" ? "" : value) as LeadStatus | "",
                page: 1,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {leadStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Search content
          </Label>
          <Input
            placeholder="Filter by keywords"
            value={filters.search}
            onChange={(event) => {
              onFilterChange({ search: event.target.value, page: 1 });
            }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (tier !== "PREMIUM") return;
                      onExport();
                    }}
                    disabled={!hasLeads || isExporting || tier !== "PREMIUM"}
                    className={`flex items-center gap-1.5 ${
                      tier !== "PREMIUM" ? "opacity-50" : ""
                    }`}
                    aria-label="Export leads to CSV"
                  >
                    {tier !== "PREMIUM" && <Lock className="h-3 w-3" />}
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </span>
              </TooltipTrigger>
              {tier !== "PREMIUM" && (
                <TooltipContent>
                  <p>Export is available on Premium plans.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {exportError && (
            <span className="text-destructive text-sm" role="alert">
              {exportError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
