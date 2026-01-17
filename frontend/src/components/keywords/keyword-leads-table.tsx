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
    <div className="border-border/60 bg-card/40 w-full overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm">
      <Table>
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
                  <TableCell className="px-4">
                    <div className="text-foreground line-clamp-1 max-w-md font-medium">
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
                        <div className="text-foreground text-sm leading-relaxed">
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
  );
}
