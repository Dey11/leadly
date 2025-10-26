import { AccountForm } from "@/components/account/account-form";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAccountSessions,
  getAccountSummary,
  getScheduleLimits,
} from "@/lib/backend-queries";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Account · Leadly",
};

export default async function AccountPage() {
  const [account, sessions, limits] = await Promise.all([
    getAccountSummary(),
    getAccountSessions(),
    getScheduleLimits(),
  ]);

  if (!account) {
    return null;
  }

  const tierLabel = limits
    ? limits.tier.toLowerCase().replace(/^\w/, (char) => char.toUpperCase())
    : "Free";

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Account settings"
        description="Update your profile, manage active sessions, and control workspace access. Billing integrations are ready for when payment is enabled."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <AccountForm
            defaultName={account.name}
            defaultEmail={account.email}
            defaultImage={account.image}
          />

          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <CardDescription>
                Sign out devices that you no longer use for Leadly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {sessions.length === 0 ? (
                <p>No other active sessions.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-border/60 bg-card/80 p-4"
                  >
                    <p className="font-medium text-foreground">
                      {session.userAgent ?? "Session"}
                    </p>
                    <p className="text-xs">
                      Expires {formatDateTime(session.expiresAt)}
                    </p>
                    {session.ipAddress && (
                      <p className="text-xs">IP: {session.ipAddress}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Workspace status</CardTitle>
              <CardDescription>Current plan and availability.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Plan</span>
                <Badge variant="outline">{tierLabel}</Badge>
              </div>
              <p>
                Payments launch soon. We have reserved space in the dashboard for
                a billing summary, so connecting a provider will be seamless.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/85">
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>
                Removing your account deletes services, monitors, and history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Once you delete your account, your session will end immediately.
                You can always create a new workspace later.
              </p>
              <DeleteAccountButton />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
