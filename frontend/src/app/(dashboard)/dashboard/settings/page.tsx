import { Suspense } from "react";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata = {
  title: "Settings",
};

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-full rounded-xl bg-muted" />
          <div className="h-64 w-full rounded-xl bg-muted" />
        </div>
      }
    >
      <SettingsContent tab={params.tab} />
    </Suspense>
  );
}
