"use client";

import { useState } from "react";
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
import type { LeadStatus } from "@/types/backend";
import type { KeywordFilterState, KeywordMonitorOption } from "@/types/components/keyword";
import { clientApi } from "@/lib/client/api";
import { useDebouncedCallback } from "use-debounce";

interface KeywordLeadsFilterBarProps {
  filters: KeywordFilterState;
  monitors: KeywordMonitorOption[];
  onFilterChange: (filters: Partial<KeywordFilterState>) => void;
  tier: string;
  hasLeads: boolean;
}

const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Viewed", value: "VIEWED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function KeywordLeadsFilterBar({
  filters,
  monitors,
  onFilterChange,
  tier,
  hasLeads,
}: KeywordLeadsFilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFilterChange({ search: value, page: 1 });
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleExport = async () => {
    if (tier !== "PREMIUM") return;
    try {
      const blob = await clientApi.exportKeywordLeadsCsv({
        keywordMonitorId: filters.keywordMonitorId || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "keyword-leads.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="border-border/60 bg-card/80 rounded-3xl border p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Keyword Leads</h1>
          <p className="text-muted-foreground text-sm">
            Review and manage posts matching your keyword sets.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Monitor
          </Label>
          <Select
            value={filters.keywordMonitorId || "all"}
            onValueChange={(value) => {
              onFilterChange({
                keywordMonitorId: value === "all" ? "" : value,
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
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            maxLength={100}
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
                    onClick={handleExport}
                    disabled={!hasLeads || tier !== "PREMIUM"}
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
        </div>
      </div>
    </div>
  );
}
