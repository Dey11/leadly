import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Layers,
  ListChecks,
  Radar,
  Search,
  Tags,
} from "lucide-react";
import { RefreshController } from "@/components/shared/refresh-controller";

import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardScheduleCard } from "@/components/dashboard/schedule-card";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import { KeywordSpotlightCards } from "@/components/keywords/keyword-spotlight-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getKeywordStats,
  getKeywordSchedule,
  getAccountSessions,
} from "@/lib/backend-queries";
import { formatDateTime, formatRelative } from "@/lib/format";
import { numberFormatter, JOB_STATUS_STYLES } from "@/constants/dashboard";

export async function KeywordOverviewContent() {
  const [stats, schedule, sessions] = await Promise.all([
    getKeywordStats(),
    getKeywordSchedule(),
    getAccountSessions(),
  ]);

  const keywordSetsCount = stats?.keywordSetsCount ?? 0;
  const monitorsCount = stats?.keywordMonitorsCount ?? 0;
  const activeMonitors = stats?.activeMonitors ?? 0;
  const pausedMonitors = stats?.pausedMonitors ?? 0;
  const totalMatches = stats?.totalMatches ?? 0;
  const matchesLast7Days = stats?.matchesLast7Days ?? 0;
  const recentActivity = stats?.recentActivity ?? [];
  const lastCompletedAt = stats?.lastCompletedAt ?? null;
  const lastJobMatches = stats?.lastJobMatches ?? 0;
  const recentMatches = stats?.recentMatches ?? [];

  const keywordsTrendLabel =
    keywordSetsCount === 0
      ? "Create your first group"
      : `${keywordSetsCount} keyword group${keywordSetsCount > 1 ? "s" : ""}`;
  const keywordsTrendTone: "positive" | "negative" | "neutral" =
    keywordSetsCount > 0 ? "positive" : "neutral";

  const monitorsTrendLabel =
    monitorsCount === 0
      ? "Add monitors"
      : pausedMonitors > 0
        ? `${activeMonitors} active · ${pausedMonitors} paused`
        : `${activeMonitors} active monitors`;
  const monitorsTrendTone: "positive" | "negative" | "neutral" =
    monitorsCount === 0
      ? "neutral"
      : pausedMonitors === 0
        ? "positive"
        : "neutral";

  const matchesTrendLabel =
    matchesLast7Days > 0
      ? `+${matchesLast7Days} this week`
      : "Awaiting matches";
  const matchesTrendTone: "positive" | "negative" | "neutral" =
    matchesLast7Days > 0 ? "positive" : "neutral";

  const totalTrendLabel =
    totalMatches > 0 ? `${totalMatches} total captured` : "No matches yet";
  const totalTrendTone: "positive" | "negative" | "neutral" =
    totalMatches > 0 ? "positive" : "neutral";

  const metrics = [
    {
      label: "Keywords",
      value: numberFormatter.format(keywordSetsCount),
      hint:
        keywordSetsCount > 0
          ? "Keyword groups defined for monitoring."
          : "Start by defining keyword groups to track.",
      icon: Tags,
      trendLabel: keywordsTrendLabel,
      trendTone: keywordsTrendTone,
    },
    {
      label: "Monitors",
      value: numberFormatter.format(monitorsCount),
      hint: "Subreddits being tracked for your keywords.",
      icon: Radar,
      trendLabel: monitorsTrendLabel,
      trendTone: monitorsTrendTone,
    },
    {
      label: "Matches (7d)",
      value: numberFormatter.format(matchesLast7Days),
      hint: "Posts matching your keywords this week.",
      icon: Search,
      trendLabel: matchesTrendLabel,
      trendTone: matchesTrendTone,
    },
    {
      label: "Total matches",
      value: numberFormatter.format(totalMatches),
      hint: "All keyword matches discovered to date.",
      icon: Layers,
      trendLabel: totalTrendLabel,
      trendTone: totalTrendTone,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <RefreshController />
      <section className="border-border/40 bg-card/60 relative overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-md md:p-8">
        <div className="bg-primary/10 pointer-events-none absolute top-0 -right-10 h-64 w-64 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col gap-6">
          <DashboardPageHeader
            title="Keyword overview"
            description="Track keyword matches across subreddits, review recent activity, and manage your monitoring."
            action={
              <Button asChild className="shadow-primary/20 shadow-lg">
                <Link href="/dashboard/keyword-leads">View all matches</Link>
              </Button>
            }
          />

          <KeywordSpotlightCards
            schedule={schedule}
            lastCompletedAt={lastCompletedAt}
            lastJobMatches={lastJobMatches}
            activeMonitors={activeMonitors}
            keywordSetsCount={keywordSetsCount}
            monitorsCount={monitorsCount}
          />
        </div>
      </section>

      <section
        id="dashboard-metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <DashboardStatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            trendLabel={metric.trendLabel}
            trendTone={metric.trendTone}
            className="bg-card/70 border-border/40 backdrop-blur-sm"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <Card
          id="recent-activity"
          className="border-border/60 bg-card/95 overflow-x-auto rounded-3xl border shadow-sm"
        >
          <CardHeader className="border-border/50 flex flex-col gap-3 border-b pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Recent scrape activity</CardTitle>
              <CardDescription>
                Monitor performance across your latest keyword scrapes.
              </CardDescription>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link href="/dashboard/keyword-monitors">Manage monitors</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="border-border/60 text-xs tracking-wide uppercase hover:bg-transparent">
                  <TableHead className="text-muted-foreground py-3 pr-4 pl-6 font-semibold">
                    Monitor
                  </TableHead>
                  <TableHead className="text-muted-foreground px-4 py-3 text-center font-semibold">
                    Keywords
                  </TableHead>
                  <TableHead className="text-muted-foreground px-4 py-3 text-center font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground px-4 py-3 text-center font-semibold">
                    Matches
                  </TableHead>
                  <TableHead className="text-muted-foreground py-3 pr-6 pl-4 text-right font-semibold">
                    Completed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center whitespace-normal"
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center text-center">
                        <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                          <ListChecks className="text-muted-foreground/50 h-6 w-6" />
                        </div>
                        <p className="text-foreground font-medium">
                          No scrape activity yet
                        </p>
                        <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                          Once your monitors are active, recent scrape jobs and
                          their matches will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentActivity.map((activity) => (
                    <TableRow
                      key={activity.lastScrapeJob.id}
                      className="border-border/40"
                    >
                      <TableCell className="text-foreground py-4 pr-4 pl-6 font-medium">
                        {activity.target}
                      </TableCell>
                      <TableCell className="text-muted-foreground px-4 py-4 text-center">
                        {activity.keywordSetName}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-center">
                        <Badge
                          className={`${JOB_STATUS_STYLES[activity.lastScrapeJob.status as keyof typeof JOB_STATUS_STYLES] || ""} capitalize`}
                        >
                          {activity.lastScrapeJob.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-primary px-4 py-4 text-center font-semibold">
                        {activity.lastScrapeJob.matchCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-4 pr-6 pl-4 text-right">
                        {activity.lastScrapeJob.completedAt
                          ? formatRelative(activity.lastScrapeJob.completedAt)
                          : "Pending"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <DashboardScheduleCard schedule={schedule} productMode="keyword" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
          <CardHeader className="border-border/50 border-b pb-6">
            <CardTitle>Recent matches</CardTitle>
            <CardDescription>
              Highlights from the latest keyword matches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {recentMatches.length === 0 ? (
              <div className="border-border/60 bg-background/80 text-muted-foreground flex flex-col items-center justify-center rounded-2xl border p-8 text-center">
                <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                  <FileText className="text-muted-foreground/50 h-6 w-6" />
                </div>
                <p className="text-foreground font-medium">No matches yet</p>
                <p className="text-sm mt-1">Matches will appear here once your monitors find posts.</p>
              </div>
            ) : (
              recentMatches.map((match) => {
                const contentPreview = match.content.split("\n")[0].slice(0, 120);
                return (
                  <a
                    key={match.id}
                    href={match.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border/60 bg-background/80 hover:bg-primary/5 hover:border-primary/30 group flex flex-col gap-2 rounded-2xl border p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground line-clamp-2 text-sm font-medium leading-snug">
                        {contentPreview}{contentPreview.length < match.content.split("\n")[0].length ? "..." : ""}
                      </p>
                      <ExternalLink className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {match.matchedKeywords.slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {match.matchedKeywords.length > 3 && (
                        <span className="text-muted-foreground text-xs">+{match.matchedKeywords.length - 3} more</span>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span className="text-primary font-medium">r/{match.target}</span>
                      <span>•</span>
                      <span>{formatRelative(match.createdAt)}</span>
                    </div>
                  </a>
                );
              })
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/keyword-leads">View all matches</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/95 rounded-3xl border shadow-sm">
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Devices currently authenticated.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            {sessions.length === 0 ? (
              <p>No other sessions detected.</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="border-border/60 bg-background/85 rounded-2xl border px-4 py-3"
                >
                  <p className="text-foreground font-medium">
                    {session.userAgent ?? "Session"}
                  </p>
                  <p className="text-xs">
                    Expires {formatDateTime(session.expiresAt)}
                  </p>
                </div>
              ))
            )}
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href="/dashboard/account">Manage sessions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
