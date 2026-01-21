"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Radar, Trash2, Pause, Play, Pencil } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { clientApi } from "@/lib/client/api";
import { formatRelative } from "@/lib/format";
import { CreateKeywordMonitorDialog } from "./create-keyword-monitor-dialog";
import { EditKeywordMonitorDialog } from "./edit-keyword-monitor-dialog";
import type { KeywordMonitor, KeywordSet } from "@/types/keyword";
import { BILLING_PLANS, type BillingTier } from "@/constants/pricing";

export function KeywordMonitorsContent() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<KeywordMonitor | null>(null);
  const [deletingMonitor, setDeletingMonitor] = useState<KeywordMonitor | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const monitorsQuery = useQuery({
    queryKey: ["keyword-monitors"],
    queryFn: () => clientApi.listKeywordMonitors(),
  });

  const keywordSetsQuery = useQuery({
    queryKey: ["keyword-sets"],
    queryFn: () => clientApi.listKeywordSets(),
  });

  const usageQuery = useQuery({
    queryKey: ["usage-summary"],
    queryFn: () => clientApi.getUsageSummary(),
  });

  // Get limits from BILLING_PLANS based on user tier
  const tier = (usageQuery.data?.payload?.tier ?? "FREE") as BillingTier;
  const planLimits = BILLING_PLANS[tier];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      clientApi.updateKeywordMonitor(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyword-monitors"] });
      setFeedback("Monitor status updated.");
    },
    onError: (err: unknown) => {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update monitor",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientApi.deleteKeywordMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyword-monitors"] });
      setFeedback("Monitor deleted successfully.");
      setDeletingMonitor(null);
    },
    onError: (err: unknown) => {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to delete monitor",
      );
    },
  });

  const monitors = (monitorsQuery.data ?? []) as KeywordMonitor[];
  const keywordSets = (keywordSetsQuery.data ?? []) as KeywordSet[];

  // Memoize handler per Rule 5.5
  const toggleStatus = useCallback(
    (monitor: KeywordMonitor) => {
      const newStatus = monitor.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      updateMutation.mutate({ id: monitor.id, status: newStatus });
    },
    [updateMutation],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <DashboardPageHeader
        title="Keyword Monitors"
        description="Track specific subreddits for your keywords. Each monitor watches a target and reports matches."
        action={
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {monitors.length}/{planLimits.keywordMonitors} monitors
            </Badge>
            <Button
              id="create-keyword-monitor-button"
              onClick={() => setCreateDialogOpen(true)}
              className="shadow-primary/20 shadow-lg"
              disabled={keywordSets.length === 0 || monitors.length >= planLimits.keywordMonitors}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Monitor
            </Button>
          </div>
        }
      />

      {feedback && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <section id="keyword-monitor-list" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {monitorsQuery.isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-muted/70 h-48 animate-pulse rounded-2xl"
              />
            ))
          ) : monitors.length === 0 ? (
            <div className="md:col-span-2">
              <Card className="from-card/80 to-muted/30 border-border/60 flex flex-col items-center justify-center border-2 border-dashed bg-gradient-to-br px-6 py-12">
                <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                  <Radar className="h-8 w-8" />
                </div>
                <h3 className="text-center text-lg font-semibold">
                  No keyword monitors yet
                </h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm leading-relaxed">
                  {keywordSets.length === 0
                    ? "Create a keyword set first, then add monitors to track specific subreddits."
                    : "Add a monitor to start tracking matches for your keywords."}
                </p>
                {keywordSets.length > 0 ? (
                  <Button
                    className="mt-5"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Add Monitor
                  </Button>
                ) : (
                  <Button className="mt-5" asChild>
                    <a href="/dashboard/keyword-sets">Create Keyword Set</a>
                  </Button>
                )}
              </Card>
            </div>
          ) : (
            monitors.map((monitor) => (
              <Card
                key={monitor.id}
                className="border-border/60 bg-background/85"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{monitor.target}</CardTitle>
                    <Badge
                      variant={
                        monitor.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {monitor.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Linked to: {monitor.keywordSet?.name || "Unknown set"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="bg-secondary/30 flex items-center justify-between rounded-xl p-3">
                    <span className="text-muted-foreground">Platform</span>
                    <span className="text-foreground font-medium">
                      {monitor.platform}
                    </span>
                  </div>
                  <div className="bg-secondary/30 flex items-center justify-between rounded-xl p-3">
                    <span className="text-muted-foreground">Last scraped</span>
                    <span className="text-foreground font-medium">
                      {monitor.lastScrapedAt
                        ? formatRelative(monitor.lastScrapedAt)
                        : "Never"}
                    </span>
                  </div>
                  {monitor.keywordSet && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {monitor.keywordSet.keywords.slice(0, 5).map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {monitor.keywordSet.keywords.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{monitor.keywordSet.keywords.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingMonitor(monitor)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(monitor)}
                    disabled={updateMutation.isPending}
                  >
                    {monitor.status === "ACTIVE" ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Resume
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 ml-auto"
                    onClick={() => setDeletingMonitor(monitor)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>

      <CreateKeywordMonitorDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        keywordSets={keywordSets}
        currentMonitorsCount={monitors.length}
        maxMonitors={planLimits.keywordMonitors}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setFeedback("Monitor created successfully.");
          queryClient.invalidateQueries({ queryKey: ["keyword-monitors"] });
        }}
      />

      {editingMonitor && (
        <EditKeywordMonitorDialog
          open={!!editingMonitor}
          onOpenChange={(open) => !open && setEditingMonitor(null)}
          monitor={editingMonitor}
          keywordSets={keywordSets}
          onSuccess={() => {
            setEditingMonitor(null);
            setFeedback("Monitor updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["keyword-monitors"] });
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingMonitor}
        onOpenChange={(open) => !open && setDeletingMonitor(null)}
        title="Delete monitor?"
        description={
          deletingMonitor
            ? `This will stop monitoring "${deletingMonitor.target}" and remove all associated data.`
            : ""
        }
        confirmLabel="Delete"
        tone="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() =>
          deletingMonitor && deleteMutation.mutate(deletingMonitor.id)
        }
      />
    </div>
  );
}

