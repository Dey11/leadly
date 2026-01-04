import { LeadsView } from "@/components/leads/leads-view";
import { getMonitors, getUsageSummary } from "@/lib/backend-queries";

export async function LeadsContent() {
  const [monitors, usage] = await Promise.all([
    getMonitors(),
    getUsageSummary(),
  ]);

  const monitorOptions = monitors.map((monitor) => ({
    id: monitor.id,
    label: monitor.icp
      ? `${monitor.icp.name} · ${monitor.target}`
      : monitor.target,
  }));

  return (
    <div id="leads-view" className="flex flex-col gap-6">
      <LeadsView
        monitors={monitorOptions}
        tier={usage?.payload?.tier ?? "FREE"}
      />
    </div>
  );
}
