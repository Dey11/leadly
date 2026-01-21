"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Tags, Trash2, Pencil } from "lucide-react";

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
import { CreateKeywordSetDialog } from "./create-keyword-set-dialog";
import { EditKeywordSetDialog } from "./edit-keyword-set-dialog";
import type { KeywordSet } from "@/types/keyword";
import { BILLING_PLANS, type BillingTier } from "@/constants/pricing";

export function KeywordSetsContent() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<KeywordSet | null>(null);
  const [deletingSet, setDeletingSet] = useState<KeywordSet | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const deleteSetMutation = useMutation({
    mutationFn: (id: string) => clientApi.deleteKeywordSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyword-sets"] });
      setFeedback("Keyword set deleted successfully.");
      setDeletingSet(null);
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete keyword set.",
      );
    },
  });

  const keywordSets = (keywordSetsQuery.data ?? []) as KeywordSet[];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <DashboardPageHeader
        title="Keywords"
        description="Define groups of keywords to monitor across platforms. Each group can be linked to multiple monitors for targeted match discovery."
        action={
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="shadow-primary/20 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Keyword Set
          </Button>
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
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <section id="keyword-sets-list" className="space-y-6">
        <div className="grid gap-6">
          {keywordSetsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/70 h-48 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : keywordSets.length === 0 ? (
            <Card className="from-card/80 to-muted/30 border-border/60 flex flex-col items-center justify-center border-2 border-dashed bg-gradient-to-br px-6 py-12">
              <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <Tags className="h-8 w-8" />
              </div>
              <h3 className="text-center text-lg font-semibold">
                Create your first keyword group
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm leading-relaxed">
                Define groups of keywords to monitor. Each group can track
                multiple terms across your chosen platforms.
              </p>
              <Button
                className="mt-5"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Keyword Group
              </Button>
            </Card>
          ) : (
            keywordSets.map((keywordSet) => (
              <Card
                key={keywordSet.id}
                className="border-border/60 bg-background/85"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-lg">{keywordSet.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {keywordSet.keywords.length} keywords
                    </Badge>
                  </div>
                  <CardDescription>
                    Created {formatRelative(keywordSet.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-4 text-sm">
                  <div className="bg-secondary/30 rounded-2xl p-4">
                    <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {keywordSet.keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-background/80"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {keywordSet.keywordMonitors &&
                  keywordSet.keywordMonitors.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Linked Monitors
                      </p>
                      <ul className="space-y-2">
                        {keywordSet.keywordMonitors
                          .slice(0, 3)
                          .map((monitor) => (
                            <li
                              key={monitor.id}
                              className="border-border/60 bg-card/80 flex items-center justify-between rounded-xl border px-4 py-2"
                            >
                              <p className="text-foreground font-medium">
                                {monitor.target}
                              </p>
                              <Badge
                                variant={
                                  monitor.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {monitor.status}
                              </Badge>
                            </li>
                          ))}
                      </ul>
                      {keywordSet.keywordMonitors.length > 3 && (
                        <p className="text-muted-foreground text-xs">
                          +{keywordSet.keywordMonitors.length - 3} more monitors
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No monitors linked yet. Add a monitor to start capturing
                      keyword matches.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSet(keywordSet)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingSet(keywordSet)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>

      <CreateKeywordSetDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        keywordsLimit={planLimits.keywordsPerSet}
        currentSetsCount={keywordSets.length}
        maxSets={planLimits.keywordSets}
        tier={tier}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setFeedback("Keyword set created successfully.");
          queryClient.invalidateQueries({ queryKey: ["keyword-sets"] });
        }}
      />

      {editingSet && (
        <EditKeywordSetDialog
          keywordSet={editingSet}
          open={!!editingSet}
          onOpenChange={(open) => !open && setEditingSet(null)}
          tier={tier}
          onSuccess={() => {
            setEditingSet(null);
            setFeedback("Keyword set updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["keyword-sets"] });
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingSet}
        onOpenChange={(open) => !open && setDeletingSet(null)}
        title="Delete keyword set?"
        description={
          deletingSet
            ? `This will remove "${deletingSet.name}" and unlink all associated monitors.`
            : "This will remove the keyword set."
        }
        confirmLabel="Delete"
        tone="destructive"
        loading={deleteSetMutation.isPending}
        onConfirm={() =>
          deletingSet && deleteSetMutation.mutate(deletingSet.id)
        }
      />
    </div>
  );
}
