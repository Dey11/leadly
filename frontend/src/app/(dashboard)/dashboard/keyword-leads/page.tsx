import { Suspense } from "react";
import { KeywordLeadsContent } from "@/components/keywords/keyword-leads-content";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Matches · ${siteConfig.name}`,
};

function KeywordLeadsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-muted/70 h-48 animate-pulse rounded-3xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted/70 h-20 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function KeywordLeadsPage() {
  return (
    <Suspense fallback={<KeywordLeadsSkeleton />}>
      <KeywordLeadsContent />
    </Suspense>
  );
}
