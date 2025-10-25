import { LeadsView } from "@/components/leads/leads-view";
import { getMonitors } from "@/lib/backend-queries";

export const metadata = {
  title: "Leads · Leadly",
};

export default async function LeadsPage() {
  const monitors = await getMonitors();

  const monitorOptions = monitors.map((monitor) => ({
    id: monitor.id,
    label: monitor.service
      ? `${monitor.service.name} · ${monitor.target}`
      : monitor.target,
  }));

  return (
    <div className="flex flex-col gap-6">
      <LeadsView monitors={monitorOptions} />
    </div>
  );
}
