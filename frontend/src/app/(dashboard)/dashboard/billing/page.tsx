import { Suspense } from "react";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { BillingContent } from "@/components/billing/billing-content";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Billing · ${siteConfig.name}`,
};

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingContent />
    </Suspense>
  );
}
