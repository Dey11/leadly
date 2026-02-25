import type { ReactNode } from "react";
import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DeleteIcpButton } from "@/components/icps/delete-icp-button";
import { EditIcpDialog } from "@/components/icps/edit-icp-dialog";
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
import { getIcps } from "@/lib/backend-queries";
import { formatDate, formatRelative } from "@/lib/format";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { MONITOR_STATUS_CONFIG } from "@/constants/dashboard";

export async function IcpsContent() {
  const icps = await getIcps();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <DashboardPageHeader
        title="ICP library"
        description="Document detailed buyer definitions so Leadly can recognise the conversations that matter and qualify intent with confidence. ICPs (Ideal Customer Profiles) are buyer definitions that are used to identify the conversations that matter and qualify intent with confidence."
        action={
          <Button
            asChild
            className="shadow-primary/20 shadow-lg"
            id="create-icp-form"
          >
            <Link href="/dashboard/icps/create">
              <Plus className="mr-2 h-4 w-4" /> Create New ICP
            </Link>
          </Button>
        }
      />

      <section id="icp-list" className="space-y-6">
        <div className="grid gap-6">
          {icps.length === 0 ? (
            <EmptyState
              icon={<Plus className="h-8 w-8" />}
              title="Get started with your first ICP"
              description="Spell out your ideal customer profile to tailor monitoring, scoring, and outreach context. Each ICP can power multiple monitors."
              action={{
                label: "Create ICP",
                href: "/dashboard/icps/create",
              }}
            />
          ) : (
            icps.map((icp) => {
              const monitorCount = icp.monitors.length;
              const status =
                MONITOR_STATUS_CONFIG[icp.status] ??
                MONITOR_STATUS_CONFIG.ACTIVE;
              return (
                <Card
                  key={icp.id}
                  className="border-border/60 bg-background/85"
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-3">
                      <CardTitle className="text-lg">{icp.name}</CardTitle>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <CardDescription className="leading-relaxed">
                      {icp.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground space-y-4 text-sm">
                    <div className="bg-secondary/30 text-muted-foreground grid gap-2 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-sm font-semibold">
                          Platform
                        </span>
                        <span>{icp.platform}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-sm font-semibold">
                          Monitors
                        </span>
                        <span>{monitorCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-sm font-semibold">
                          Created
                        </span>
                        <span>{formatDate(icp.createdAt)}</span>
                      </div>
                    </div>

                    <div className="border-border/60 bg-card/80 grid gap-3 rounded-2xl border p-4">
                      <Section label="Target persona">
                        {icp.targetPersona}
                      </Section>
                      <Section label="Pain points">{icp.pains}</Section>
                      <Section label="Value proposition">
                        {icp.valueProposition}
                      </Section>
                      <Section label="Qualifying signals">
                        {icp.qualifyingSignals}
                      </Section>
                      <Section label="Disqualifying signals">
                        {icp.disqualifyingSignals}
                      </Section>
                    </div>

                    {monitorCount > 0 ? (
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                          Monitors
                        </p>
                        <ul className="space-y-2">
                          {icp.monitors.slice(0, 3).map((monitor) => (
                            <li
                              key={monitor.id}
                              className="border-border/60 bg-card/80 flex items-center justify-between rounded-xl border px-4 py-2"
                            >
                              <div>
                                <p className="text-foreground font-medium">
                                  {monitor.target}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Updated {formatRelative(monitor.updatedAt)}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  MONITOR_STATUS_CONFIG[monitor.status]
                                    ?.variant ?? "outline"
                                }
                              >
                                {MONITOR_STATUS_CONFIG[monitor.status]?.label ??
                                  monitor.status}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                        {monitorCount > 3 ? (
                          <p className="text-muted-foreground text-xs">
                            {monitorCount - 3} more monitor
                            {monitorCount - 3 === 1 ? "" : "s"} in this ICP.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No monitors yet. Add one to start capturing leads for
                        this ICP.
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" asChild size="sm">
                      <a href="/dashboard/monitors">Add monitor</a>
                    </Button>
                    <EditIcpDialog icp={icp} />
                    <div className="ml-auto">
                      <DeleteIcpButton icpId={icp.id} />
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground leading-relaxed">{children}</p>
    </div>
  );
}
