"use client";

import { useEffect } from "react";

const REFERRER_KEY = "leadly_referrer";

export function useReferrerTracking() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const referrer = document.referrer;

      // Check for specific query params
      const ref = searchParams.get("ref");
      const source = searchParams.get("source");
      const utmSource = searchParams.get("utm_source");

      // Determine the traffic source
      // Priority: ref > source > utm_source > document.referrer
      const trafficSource =
        ref ||
        source ||
        utmSource ||
        (referrer ? new URL(referrer).hostname : null);

      if (trafficSource) {
        // We only want to store the *first* source of attribution usually,
        // effectively "first touch" attribution model, or we can overwrite.
        // For now, let's persist the first one if not exists to know where they originally came from.
        // If you prefer "last touch", remove the check.
        if (!localStorage.getItem(REFERRER_KEY)) {
          localStorage.setItem(REFERRER_KEY, trafficSource);
        }
      }
    } catch (e) {
      console.error("Error tracking referrer:", e);
    }
  }, []);
}
