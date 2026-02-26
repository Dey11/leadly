"use client";

import React, { useState } from "react";
import { formatRelative } from "@/lib/format";
import { LeadSummary, LeadStatus } from "@/types/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  Eye,
  Send,
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

interface LeadsTableProps {
  leads: LeadSummary[];
  onViewDetail: (leadId: string) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onDelete: (lead: { id: string; label: string }) => void;
  onGenerateDm: (leadId: string, author: string | null) => void;
  updatingLeadId?: string | null;
  deletingLeadId?: string | null;
}

const leadStatusOptions: { label: string; value: LeadStatus }[] = [
  { label: "New", value: "NEW" },
  { label: "Viewed", value: "VIEWED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Archived", value: "ARCHIVED" },
];

const leadTypeStyles: Record<string, string> = {
  WARM: "bg-primary/10 text-primary border-primary/20",
  NEUTRAL: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  COLD: "bg-muted text-muted-foreground border-border",
};

export function LeadsTable({
  leads,
  onViewDetail,
  onStatusChange,
  onDelete,
  onGenerateDm,
  updatingLeadId,
}: LeadsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="border-border/60 bg-card/40 w-full overflow-x-auto rounded-lg border shadow-sm backdrop-blur-sm">
      <Table className="min-w-[600px]">
        <TableHeader className="bg-muted/30">
          <TableRow className="border-border/60 text-xs tracking-wide uppercase hover:bg-transparent">
            <TableHead className="text-muted-foreground w-12 px-4 font-semibold"></TableHead>
            <TableHead className="text-muted-foreground px-4 font-semibold">
              Warmth
            </TableHead>
            <TableHead className="text-muted-foreground px-4 font-semibold">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground w-[40%] px-4 font-semibold">
              Content Preview
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
                  <TableCell className="px-4">
                    <Badge
                      variant="outline"
                      className={`${leadTypeStyles[lead.leadType]} border px-2 py-0.5 shadow-none`}
                    >
                      {lead.leadType}
                    </Badge>
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
                        className="h-8 w-8"
                        onClick={() => {
                          console.log(
                            "[leads-table] Send clicked for",
                            lead.id,
                          );
                          onGenerateDm(lead.id, lead.author);
                        }}
                      >
                        <Send className="text-muted-foreground hover:text-foreground h-4 w-4" />
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
                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span>
                            Author:{" "}
                            <span className="text-foreground">
                              {lead.author || "Unknown"}
                            </span>
                          </span>
                          <span> • </span>
                          <span>Detected via {lead.platform}</span>
                          {lead.aiProvider && (
                            <>
                              <span> • </span>
                              <span>
                                AI:{" "}
                                <span className="text-foreground capitalize">
                                  {lead.aiProvider}
                                </span>
                              </span>
                            </>
                          )}
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
