import { Suspense } from "react";
import { IcpsSkeleton } from "@/components/icps/icps-skeleton";
import { IcpsContent } from "@/components/icps/icps-content";

import { siteConfig } from "@/config/site";

export const metadata = {
  title: "ICPs",
};

export default function IcpsPage() {
  return (
    <Suspense fallback={<IcpsSkeleton />}>
      <IcpsContent />
    </Suspense>
  );
}
