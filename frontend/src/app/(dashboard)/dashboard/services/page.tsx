import { CreateServiceForm } from "@/components/services/create-service-form";
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
import { getServices } from "@/lib/backend-queries";
import { formatDate, formatRelative } from "@/lib/format";
import { DeleteServiceButton } from "@/components/services/delete-service-button";

const statusMap: Record<string, { label: string; variant: "default" | "outline" | "success" | "warning" }> =
  {
    ACTIVE: { label: "Active", variant: "success" },
    PAUSED: { label: "Paused", variant: "warning" },
    ARCHIVED: { label: "Archived", variant: "outline" },
  };

export const metadata = {
  title: "Services · Leadly",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground">
            Services define the outcomes you want from each monitor. Describe
            your ICP, lead qualifications, and targeting so Leadly can generate
            high-signal insights for your team.
          </p>
          <div className="grid gap-6">
            {services.length === 0 ? (
              <Card className="bg-background/80">
                <CardHeader>
                  <CardTitle>Get started with your first service</CardTitle>
                  <CardDescription>
                    Services connect your product with the conversations you care about.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              services.map((service) => {
                const monitorCount = service.monitors.length;
                const status = statusMap[service.status] ?? statusMap.ACTIVE;
                return (
                  <Card key={service.id} className="bg-background/80">
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-lg">
                          {service.name}
                        </CardTitle>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <CardDescription className="leading-relaxed">
                        {service.leadDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                      <div className="grid gap-2 rounded-2xl bg-secondary/30 p-4 text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">
                            Platform
                          </span>
                          <span>{service.platform}</span>
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
                          <span>{formatDate(service.createdAt)}</span>
                        </div>
                      </div>
                      {monitorCount > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Monitors
                          </p>
                          <ul className="space-y-2">
                            {service.monitors.slice(0, 3).map((monitor) => (
                              <li
                                key={monitor.id}
                                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 px-4 py-2"
                              >
                                <div>
                                  <p className="font-medium text-foreground">
                                    {monitor.target}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Updated{" "}
                                    {formatRelative(monitor.updatedAt)}
                                  </p>
                                </div>
                                <Badge variant={statusMap[monitor.status]?.variant ?? "outline"}>
                                  {statusMap[monitor.status]?.label ??
                                    monitor.status}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                          {monitorCount > 3 ? (
                            <p className="text-xs text-muted-foreground">
                              {monitorCount - 3} more monitor
                              {monitorCount - 3 === 1 ? "" : "s"} in this
                              service.
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No monitors yet. Add one to start capturing leads.
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-wrap items-center gap-3">
                      <Button variant="outline" asChild size="sm">
                        <a href="/dashboard/monitors">Add monitor</a>
                      </Button>
                      <div className="ml-auto">
                        <DeleteServiceButton serviceId={service.id} />
                      </div>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <CreateServiceForm />
        </aside>
      </div>
    </div>
  );
}
