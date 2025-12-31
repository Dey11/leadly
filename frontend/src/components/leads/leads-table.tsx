"use client";

import { useState } from "react";
import { formatRelative } from "@/lib/format";
import { LeadSummary, LeadStatus } from "@/types/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";

interface LeadsTableProps {
  leads: LeadSummary[];
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
    <div className="border-border/60 bg-card/40 w-full overflow-hidden rounded-3xl border shadow-sm backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/30 text-muted-foreground">
          <tr className="border-border/60 border-b text-xs tracking-wide uppercase">
            <th className="w-12 px-6 py-4 font-semibold"></th>
            <th className="px-6 py-4 font-semibold">Warmth</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="w-[40%] px-6 py-4 font-semibold">Content Preview</th>
            <th className="px-6 py-4 font-semibold">Posted</th>
            <th className="px-6 py-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-border/40 divide-y">
          {leads.map((lead) => {
            const isExpanded = expandedRows.has(lead.id);
            const isUpdating = updatingLeadId === lead.id;

            return (
              <>
                <tr
                  key={lead.id}
                  className={`group hover:bg-muted/40 cursor-pointer transition-colors ${isExpanded ? "bg-muted/30" : ""}`}
                  onClick={() => toggleRow(lead.id)}
                >
                  <td className="text-muted-foreground px-6 py-4">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`${leadTypeStyles[lead.leadType]} border px-2 py-0.5 shadow-none`}
                    >
                      {lead.leadType}
                    </Badge>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      className="hover:bg-muted cursor-pointer rounded bg-transparent p-1 text-xs font-medium focus:outline-none"
                      value={lead.status}
                      onChange={(e) =>
                        onStatusChange(lead.id, e.target.value as LeadStatus)
                      }
                      disabled={isUpdating}
                    >
                      {leadStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-foreground line-clamp-1 max-w-md font-medium">
                      {lead.content}
                    </div>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 whitespace-nowrap">
                    {formatRelative(lead.createdAt)}
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-muted/30">
                    <td colSpan={6} className="px-6 pt-0 pb-6">
                      <div className="border-border/60 ml-12 space-y-3 border-l-2 pl-6">
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
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
