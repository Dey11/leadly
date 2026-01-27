import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { AccountContent } from "@/components/account/account-content";
import { BillingContent } from "@/components/billing/billing-content";
import { ProfileSettings } from "@/components/account/profile-settings";
import { AccountSkeleton } from "@/components/account/account-skeleton";
import { BillingSkeleton } from "@/components/billing/billing-skeleton";

interface SettingsContentProps {
  tab?: string;
}

export async function SettingsContent({ tab = "account" }: SettingsContentProps) {
  const activeTab = ["account", "billing", "profile"].includes(tab) ? tab : "account";

  return (
    <div className="flex flex-col gap-2">
      <DashboardPageHeader
        title="Settings"
        description="Manage your account, billing, and profile preferences."
      />

      <SettingsTabs activeTab={activeTab as "account" | "billing" | "profile"} />

      <div className="min-h-[400px]">
        {activeTab === "account" && (
          <Suspense fallback={<AccountSkeleton />}>
            <AccountContent />
          </Suspense>
        )}
        {activeTab === "billing" && (
          <Suspense fallback={<BillingSkeleton />}>
            <BillingContent />
          </Suspense>
        )}
        {activeTab === "profile" && <ProfileSettings />}
      </div>
    </div>
  );
}
