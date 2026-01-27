"use client";

import React, { useState, useCallback } from "react";
import { formatRelative } from "@/lib/format";
import { LeadStatus } from "@/types/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { KeywordLeadSummary } from "@/types/keyword";

interface KeywordLeadsTableProps {
  leads: KeywordLeadSummary[];
  onViewDetail: (leadId: string) => void;
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

// Mobile card component for each lead
function MobileLeadCard({
  lead,
  isExpanded,
  isUpdating,
  onToggle,
  onViewDetail,
  onStatusChange,
  onDelete,
}: {
  lead: KeywordLeadSummary;
  isExpanded: boolean;
  isUpdating: boolean;
  onToggle: () => void;
  onViewDetail: () => void;
  onStatusChange: (status: LeadStatus) => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border/60 bg-card/60 rounded-lg border p-3">
      {/* Header row: Status dropdown + Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <Select
          value={lead.status}
          onValueChange={(value) => onStatusChange(value as LeadStatus)}
          disabled={isUpdating}
        >
          <SelectTrigger className="h-7 w-auto min-w-[80px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {leadStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onViewDetail}
          >
            <Eye className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-destructive/10 h-7 w-7"
            onClick={onDelete}
          >
            <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <a href={lead.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="text-muted-foreground h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Content preview - tap to expand */}
      <div
        className="cursor-pointer"
        onClick={onToggle}
      >
        <p className={`text-foreground text-sm font-medium leading-snug ${isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
          {lead.content}
        </p>
      </div>

      {/* Footer row: Keywords + Time */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {lead.matchedKeywords.slice(0, 2).map((kw, i) => (
            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
              {kw}
            </Badge>
          ))}
          {lead.matchedKeywords.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              +{lead.matchedKeywords.length - 2}
            </Badge>
          )}
        </div>
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {formatRelative(lead.createdAt)}
        </span>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase">
              All Keywords
            </p>
            <div className="flex flex-wrap gap-1">
              {lead.matchedKeywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            <span>Author: </span>
            <span className="text-foreground">{lead.author || "Unknown"}</span>
            <span> • </span>
            <span>{lead.platform}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function KeywordLeadsTable({
  leads,
  onViewDetail,
  onStatusChange,
  onDelete,
  updatingLeadId,
}: KeywordLeadsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  return (
    <>
      {/* Mobile card layout - shown below md breakpoint */}
      <div className="md:hidden space-y-2">
        {leads.map((lead) => (
          <MobileLeadCard
            key={lead.id}
            lead={lead}
            isExpanded={expandedRows.has(lead.id)}
            isUpdating={updatingLeadId === lead.id}
            onToggle={() => toggleRow(lead.id)}
            onViewDetail={() => onViewDetail(lead.id)}
            onStatusChange={(status) => onStatusChange(lead.id, status)}
            onDelete={() => onDelete({ id: lead.id, label: lead.content })}
          />
        ))}
      </div>

      {/* Desktop table layout - hidden below md breakpoint */}
      <div className="border-border/60 bg-card/40 hidden md:block w-full overflow-x-auto rounded-lg border shadow-sm backdrop-blur-sm">
        <Table className="min-w-[600px] table-fixed">
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/60 text-xs tracking-wide uppercase hover:bg-transparent">
              <TableHead className="text-muted-foreground w-12 px-4 font-semibold"></TableHead>
              <TableHead className="text-muted-foreground px-4 font-semibold">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground w-[40%] px-4 font-semibold">
                Content Preview
              </TableHead>
              <TableHead className="text-muted-foreground px-4 font-semibold">
                Matched
              </TableHead>
              <TableHead className="text-muted-foreground px-4 font-semibold">
                Posted
              </TableHead>
              <TableHead className="text-muted-foreground px-4 text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-border/40 divide-y">
            {leads.map((lead) => {
              const isExpanded = expandedRows.has(lead.id);
              const isUpdating = updatingLeadId === lead.id;

              return (
                <React.Fragment key={lead.id}>
                  <TableRow
                    className={`group cursor-pointer transition-colors ${isExpanded ? "bg-muted/30" : ""}`}
                    onClick={() => toggleRow(lead.id)}
                  >
                    <TableCell className="text-muted-foreground px-4">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell
                      className="px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Select
                        value={lead.status}
                        onValueChange={(value) =>
                          onStatusChange(lead.id, value as LeadStatus)
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadStatusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="overflow-hidden px-4">
                      <div className="text-foreground truncate font-medium">
                        {lead.content}
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-wrap gap-1">
                        {lead.matchedKeywords.slice(0, 2).map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                        {lead.matchedKeywords.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lead.matchedKeywords.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground px-4">
                      {formatRelative(lead.createdAt)}
                    </TableCell>
                    <TableCell
                      className="px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onViewDetail(lead.id)}
                        >
                          <Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 h-8 w-8"
                          onClick={() =>
                            onDelete({ id: lead.id, label: lead.content })
                          }
                        >
                          <Trash2 className="text-muted-foreground hover:text-destructive h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={lead.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="text-muted-foreground hover:text-foreground h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell colSpan={6} className="px-4 pt-0 pb-4">
                        <div className="border-border/60 ml-8 space-y-3 border-l-2 pl-6">
                          <div className="text-foreground max-h-48 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                            {lead.content}
                          </div>
                          <div className="space-y-2">
                            <p className="text-muted-foreground text-xs font-semibold uppercase">
                              Matched Keywords
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {lead.matchedKeywords.map((kw, i) => (
                                <Badge key={i} variant="secondary">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-4 text-xs">
                            <span>
                              Author:{" "}
                              <span className="text-foreground">
                                {lead.author || "Unknown"}
                              </span>
                            </span>
                            <span> • </span>
                            <span>Detected via {lead.platform}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
