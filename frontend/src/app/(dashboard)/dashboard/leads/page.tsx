import { LeadsView } from "@/components/leads/leads-view";
import { getMonitors } from "@/lib/backend-queries";

export const metadata = {
  title: "Leads · Leadly",
};

export default async function LeadsPage() {
  const monitors = await getMonitors();

  const monitorOptions = monitors.map((monitor) => ({
    id: monitor.id,
    label: monitor.icp
      ? `${monitor.icp.name} · ${monitor.target}`
      : monitor.target,
  }));

  return (
    <div id="leads-view" className="flex flex-col gap-6">
      <LeadsView monitors={monitorOptions} />
    </div>
  );
}
