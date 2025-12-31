"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DATA_REFRESH_INTERVAL } from "@/constants/config";

export function RefreshController() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, DATA_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
