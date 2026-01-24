import { Suspense } from "react";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";
import { BillingContent } from "@/components/billing/billing-content";
export const metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingContent />
    </Suspense>
  );
}
