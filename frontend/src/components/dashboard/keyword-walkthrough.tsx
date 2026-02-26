"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useProductMode } from "@/components/dashboard/product-mode-toggle";

interface StepConfig {
  index: number;
  route: string;
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
  };
}

const KEYWORD_STEPS: StepConfig[] = [
  {
    index: 0,
    route: "/dashboard",
    element: "#dashboard-sidebar",
    popover: {
      title: "Navigation Sidebar",
      description:
        "Access all your keyword tools here: Matches, Keywords, Monitors, Schedule and Billing.",
      side: "right",
      align: "start",
    },
  },
  {
    index: 1,
    route: "/dashboard",
    element: "#dashboard-metrics",
    popover: {
      title: "Keyword Metrics",
      description:
        "Get a high-level view of your keyword monitoring performance and match counts.",
      side: "top",
      align: "center",
    },
  },
  {
    index: 2,
    route: "/dashboard/keyword-leads",
    element: "#keyword-leads-view",
    popover: {
      title: "Your Matches",
      description:
        "Browse and filter all the keyword matches Leadly has found for you.",
      side: "top",
      align: "start",
    },
  },
  {
    index: 3,
    route: "/dashboard/keyword-sets",
    element: "#create-keyword-set-button",
    popover: {
      title: "Create Keyword Sets",
      description:
        "Define groups of keywords to monitor. Each set can track multiple terms across subreddits.",
      side: "bottom",
      align: "start",
    },
  },
  {
    index: 4,
    route: "/dashboard/keyword-sets",
    element: "#keyword-sets-list",
    popover: {
      title: "Manage Keyword Groups",
      description: "View, edit, and organise your existing keyword sets here.",
      side: "top",
      align: "start",
    },
  },
  {
    index: 5,
    route: "/dashboard/keyword-monitors",
    element: "#create-keyword-monitor-button",
    popover: {
      title: "Add Monitors",
      description:
        "Create monitors to track specific subreddits for your keywords. Link a keyword set to start capturing matches.",
      side: "bottom",
      align: "start",
    },
  },
  {
    index: 6,
    route: "/dashboard/keyword-monitors",
    element: "#keyword-monitor-list",
    popover: {
      title: "Active Monitors",
      description:
        "Track the status and performance of your keyword monitors here.",
      side: "top",
      align: "start",
    },
  },
  {
    index: 7,
    route: "/dashboard/schedule",
    element: "#schedule-form",
    popover: {
      title: "Scrape Schedule",
      description:
        "Configure the exact hours you want Leadly to scan for keyword matches.",
      side: "right",
      align: "start",
    },
  },
  {
    index: 8,
    route: "/dashboard/schedule",
    element: "#plan-limits",
    popover: {
      title: "Plan Limits",
      description:
        "Keep an eye on your usage limits based on your subscription tier.",
      side: "right",
      align: "start",
    },
  },
  {
    index: 9,
    route: "/dashboard",
    popover: {
      title: "Ready to go!",
      description:
        "You are all set. Start by creating a keyword set and linking it to a monitor.",
    },
  },
];

export function KeywordWalkthrough() {
  const [productMode] = useProductMode();
  const driverObj = useRef<Driver | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathnameRef = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCleaningUpRef = useRef(false);

  // Keep ref in sync so callbacks always read the latest pathname
  pathnameRef.current = pathname;

  useEffect(() => {
    if (productMode !== "keyword") {
      return;
    }

    const styleId = "driver-js-theme";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .driver-popover {
          background-color: var(--card) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 1rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          font-family: inherit !important;
        }
        .driver-popover-title {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
        }
        .driver-popover-description {
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
          color: var(--muted-foreground) !important;
          margin-bottom: 1rem !important;
        }
        .driver-popover-footer button {
          background-color: var(--primary) !important;
          color: var(--primary-foreground) !important;
          border: none !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          font-weight: 500 !important;
          text-shadow: none !important;
        }
        .driver-popover-footer button.driver-close-btn {
          background-color: transparent !important;
          color: var(--muted-foreground) !important;
          border: 1px solid var(--border) !important;
        }
        .driver-popover-footer button:hover {
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const forceRestart = urlParams.get("keyword-walkthrough") === "restart";

    if (forceRestart) {
      window.history.replaceState({}, "", window.location.pathname);
    } else if (
      window.localStorage.getItem("leadly-keyword-walkthrough-completed") ===
      "true"
    ) {
      return;
    }

    const storageKey = "leadly-keyword-walkthrough-step";
    const storedStepIndex = parseInt(
      window.sessionStorage.getItem(storageKey) || "0",
      10,
    );

    if (storedStepIndex >= KEYWORD_STEPS.length) {
      window.sessionStorage.removeItem(storageKey);
      return;
    }

    // Track whether this effect invocation is still active (not cleaned up)
    let isActive = true;

    // Helper: mark walkthrough as complete in localStorage
    const markComplete = () => {
      window.localStorage.setItem(
        "leadly-keyword-walkthrough-completed",
        "true",
      );
      window.sessionStorage.removeItem(storageKey);
    };

    driverObj.current = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: "Finish",
      nextBtnText: "Next",
      prevBtnText: "Previous",
      steps: KEYWORD_STEPS.map((s) => ({
        element: s.element,
        popover: s.popover,
        index: s.index,
        route: s.route,
      })),
      onNextClick: (elem, step, opts) => {
        const currentIndex = (step as any).index as number;
        const nextIndex = currentIndex + 1;

        if (nextIndex >= KEYWORD_STEPS.length) {
          driverObj.current?.destroy();
          return;
        }

        const nextStepConfig = KEYWORD_STEPS[nextIndex];
        const currentPathname = pathnameRef.current;

        window.scrollTo(0, 0);

        if (nextStepConfig.route !== currentPathname) {
          window.sessionStorage.setItem(storageKey, nextIndex.toString());
          driverObj.current?.destroy();
          router.push(nextStepConfig.route);
        } else {
          window.sessionStorage.setItem(storageKey, nextIndex.toString());
          driverObj.current?.moveNext();
        }
      },
      onPrevClick: (elem, step, opts) => {
        const currentIndex = (step as any).index as number;
        const prevIndex = currentIndex - 1;

        if (prevIndex < 0) return;

        const prevStepConfig = KEYWORD_STEPS[prevIndex];
        const currentPathname = pathnameRef.current;

        window.scrollTo(0, 0);

        if (prevStepConfig.route !== currentPathname) {
          window.sessionStorage.setItem(storageKey, prevIndex.toString());
          driverObj.current?.destroy();
          router.push(prevStepConfig.route);
        } else {
          window.sessionStorage.setItem(storageKey, prevIndex.toString());
          driverObj.current?.movePrevious();
        }
      },
      onDestroyed: () => {
        // If this destroy was triggered by effect cleanup, skip all logic
        if (isCleaningUpRef.current) return;

        // Check if sessionStorage was already cleared by onCloseClick
        const raw = window.sessionStorage.getItem(storageKey);
        if (raw === null) {
          // Already handled by onCloseClick - nothing to do
          return;
        }

        const currentIndex = parseInt(raw, 10);
        const currentPathname = pathnameRef.current;
        const isNavigating =
          currentIndex < KEYWORD_STEPS.length &&
          KEYWORD_STEPS[currentIndex]?.route !== currentPathname;

        // If we're navigating to the next page, don't mark complete
        // (the tour will resume on the new page)
        if (isNavigating) {
          return;
        }

        // Otherwise the user dismissed via overlay click or the tour ended.
        // Mark as complete so it doesn't keep resurrecting.
        markComplete();
      },
      onCloseClick: () => {
        // Explicit close/skip via the X button
        markComplete();
        driverObj.current?.destroy();
      },
    });

    const currentStepConfig = KEYWORD_STEPS[storedStepIndex];
    if (currentStepConfig && currentStepConfig.route === pathname) {
      window.scrollTo(0, 0);

      timeoutRef.current = setTimeout(() => {
        if (isActive && driverObj.current) {
          driverObj.current.drive(storedStepIndex);
        }
      }, 800);
    }

    return () => {
      isActive = false;
      // Clear pending timeout to prevent double-init (e.g. React Strict Mode)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Destroy driver if still active on unmount.
      // Flag prevents onDestroyed from incorrectly marking complete.
      if (driverObj.current) {
        isCleaningUpRef.current = true;
        driverObj.current.destroy();
        isCleaningUpRef.current = false;
        driverObj.current = null;
      }
    };
  }, [productMode, pathname, router, searchParams]);

  return null;
}
