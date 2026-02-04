"use client";

import { useRouter } from "next/navigation";
import { User, CreditCard, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "account", label: "Account", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "profile", label: "Profile", icon: UserCircle },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface SettingsTabsProps {
  activeTab: TabId;
}

export function SettingsTabs({ activeTab }: SettingsTabsProps) {
  const router = useRouter();

  const handleTabChange = (tab: TabId) => {
    router.push(`/dashboard/settings?tab=${tab}`);
  };

  return (
    <div className="border-border/60 bg-card/40 mb-6 overflow-x-auto rounded-xl border backdrop-blur-sm">
      <div className="flex min-w-max">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap",
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { TABS };
export type { TabId };
