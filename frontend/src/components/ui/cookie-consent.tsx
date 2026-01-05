"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "leadly_cookie_consent";

type ConsentType = "all" | "necessary" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentType>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "all" || stored === "necessary") {
      setConsent(stored);
      // If they accepted all, we can load analytics
      if (stored === "all") {
        loadAnalytics();
      }
    } else {
      // No consent stored, show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadAnalytics = () => {
    // When consent is given, we trigger a page refresh or custom event
    // so that conditional scripts can pick up the change.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookie-consent-updated"));
    }
  };

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    setConsent("all");
    setIsVisible(false);
    loadAnalytics();
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "necessary");
    setConsent("necessary");
    setIsVisible(false);
    // Don't load analytics - user declined
    console.log("User declined analytics cookies");
  };

  // Don't render if consent already given
  if (consent) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-4 bottom-4 z-50 max-w-md sm:inset-x-auto sm:right-4 sm:w-auto"
        >
          <div className="bg-card/95 border-border/60 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="border-border/40 flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <Cookie className="h-5 w-5" />
                </div>
                <h3 className="text-foreground font-semibold">
                  Cookie Preferences
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4 p-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                We use cookies to keep you logged in (necessary) and to
                understand how you use Leadly (analytics). You can choose which
                cookies to allow.
              </p>

              <div className="space-y-2">
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Necessary
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Authentication & security
                    </p>
                  </div>
                  <span className="rounded bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                    Always on
                  </span>
                </div>
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Analytics
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Google Analytics
                    </p>
                  </div>
                  <span className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs font-medium">
                    Optional
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <Button
                  onClick={handleNecessaryOnly}
                  variant="outline"
                  className="flex-1 text-sm"
                >
                  Necessary Only
                </Button>
                <Button onClick={handleAcceptAll} className="flex-1 text-sm">
                  Accept All
                </Button>
              </div>

              {/* Policy link */}
              <p className="text-muted-foreground text-center text-xs">
                Learn more in our{" "}
                <Link
                  href="/cookies"
                  className="text-primary hover:text-primary/80 underline underline-offset-2"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export helper to check consent status
export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "all";
}
