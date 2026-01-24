import { Suspense } from "react";
import { IcpsSkeleton } from "@/components/icps/icps-skeleton";
import { IcpsContent } from "@/components/icps/icps-content";
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
