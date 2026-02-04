import { Suspense } from "react";
import { ProfileSettings } from "@/components/account/profile-settings";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <ProfileSettings />
    </Suspense>
  );
}
