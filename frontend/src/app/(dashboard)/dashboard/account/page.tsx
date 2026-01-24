import { Suspense } from "react";
import { AccountSkeleton } from "@/components/account/account-skeleton";
import { AccountContent } from "@/components/account/account-content";
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
