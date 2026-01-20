import { KeywordLeadsView } from "@/components/keywords/keyword-leads-view";
import { getKeywordMonitors, getUsageSummary } from "@/lib/backend-queries";

export async function KeywordLeadsContent() {
  const [monitors, usage] = await Promise.all([
    getKeywordMonitors(),
    getUsageSummary(),
  ]);

  const monitorOptions = monitors.map((monitor: any) => ({
    id: monitor.id,
    label: monitor.keywordSet
      ? `${monitor.keywordSet.name} · ${monitor.target}`
      : monitor.target,
  }));

  return (
    <div id="keyword-leads-view" className="flex flex-col gap-6">
      <KeywordLeadsView
        monitors={monitorOptions}
        tier={usage?.payload?.tier ?? "FREE"}
      />
    </div>
  );
}
