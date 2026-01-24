import { Suspense } from "react";
import { LeadsSkeleton } from "@/components/leads/leads-skeleton";
import { LeadsContent } from "@/components/leads/leads-content";
export const metadata = {
  title: "Leads",
};

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsContent />
    </Suspense>
  );
}
