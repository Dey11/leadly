import type { ReactNode } from "react";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { CreateIcpForm } from "@/components/icps/create-icp-form";
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
import type { MonitorStatus } from "@/types/backend";

const statusMap: Record<
  MonitorStatus,
  { label: string; variant: "default" | "outline" | "success" | "warning" }
> =
  {
    ACTIVE: { label: "Active", variant: "success" },
    PAUSED: { label: "Paused", variant: "warning" },
    ARCHIVED: { label: "Archived", variant: "outline" },
  };

export const metadata = {
  title: "ICPs · Leadly",
};

export default async function IcpsPage() {
  const icps = await getIcps();

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="ICP library"
        description="Document detailed buyer definitions so Leadly can recognise the conversations that matter and qualify intent with confidence."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="grid gap-6">
            {icps.length === 0 ? (
              <Card className="border-border/60 bg-background/85">
                <CardHeader>
                  <CardTitle>Get started with your first ICP</CardTitle>
                  <CardDescription>
                    Spell out your ideal customer profile to tailor monitoring,
                    scoring, and outreach context. Each ICP can power multiple
                    monitors.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              icps.map((icp) => {
                const monitorCount = icp.monitors.length;
                const status = statusMap[icp.status] ?? statusMap.ACTIVE;
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
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                      <div className="grid gap-2 rounded-2xl bg-secondary/30 p-4 text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            Platform
                          </span>
                          <span>{icp.platform}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            Monitors
                          </span>
                          <span>{monitorCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            Created
                          </span>
                          <span>{formatDate(icp.createdAt)}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/80 p-4">
                        <Section label="Target persona">{icp.targetPersona}</Section>
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
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Monitors
                          </p>
                          <ul className="space-y-2">
                            {icp.monitors.slice(0, 3).map((monitor) => (
                              <li
                                key={monitor.id}
                                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-4 py-2"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {monitor.target}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Updated {formatRelative(monitor.updatedAt)}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    statusMap[monitor.status]?.variant ?? "outline"
                                  }
                                >
                                  {statusMap[monitor.status]?.label ??
                                    monitor.status}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                          {monitorCount > 3 ? (
                            <p className="text-xs text-muted-foreground">
                              {monitorCount - 3} more monitor
                              {monitorCount - 3 === 1 ? "" : "s"} in this ICP.
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No monitors yet. Add one to start capturing leads for this
                          ICP.
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

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <CreateIcpForm />
        </aside>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="leading-relaxed text-foreground">{children}</p>
    </div>
  );
}
