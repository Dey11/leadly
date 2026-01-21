import { Suspense } from "react";
import { AccountSkeleton } from "@/components/account/account-skeleton";
import { AccountContent } from "@/components/account/account-content";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountContent />
    </Suspense>
  );
}
