"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useReferrerTracking } from "@/hooks/use-referrer-tracking";
import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { hasAnalyticsConsent } from "@/components/ui/cookie-consent";

interface UmamiScriptProps {
  websiteId?: string;
  scriptUrl?: string;
}

export function UmamiScript({
  websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
    "https://analytics.umami.is/script.js",
}: UmamiScriptProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent
    setHasConsent(hasAnalyticsConsent());

    // Listen for consent updates
    const handleUpdate = () => setHasConsent(hasAnalyticsConsent());
    window.addEventListener("cookie-consent-updated", handleUpdate);
    return () =>
      window.removeEventListener("cookie-consent-updated", handleUpdate);
  }, []);

  // Trigger referrer tracking hook (always runs, but only stores in localStorage)
  useReferrerTracking();

  if (!websiteId || !hasConsent) {
    return null;
  }

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent
    setHasConsent(hasAnalyticsConsent());

    // Listen for consent updates
    const handleUpdate = () => setHasConsent(hasAnalyticsConsent());
    window.addEventListener("cookie-consent-updated", handleUpdate);
    return () =>
      window.removeEventListener("cookie-consent-updated", handleUpdate);
  }, []);

  if (!gaId || !hasConsent) return null;

  return <NextGoogleAnalytics gaId={gaId} />;
}
