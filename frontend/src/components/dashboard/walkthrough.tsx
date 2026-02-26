"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { clientApi } from "@/lib/client/api";
import { useProductMode } from "@/components/dashboard/product-mode-toggle";

interface WalkthroughProps {
  hasSeenWalkthrough: boolean;
  hasCompletedOnboarding: boolean;
}

interface StepConfig {
  index: number;
  route: string;
  element?: string; // Optional - no element creates centered modal
  popover: {
    title: string;
    description: string;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
  };
}

const STEPS: StepConfig[] = [
  // Dashboard
  {
    index: 0,
    route: "/dashboard",
    element: "#dashboard-sidebar",
    popover: {
      title: "Navigation Sidebar",
      description:
        "Access all your tools here: Leads, ICPs, Monitors, Schedule and Billing.",
      side: "right",
      align: "start",
    },
  },
  {
    index: 1,
    route: "/dashboard",
    element: "#dashboard-metrics",
    popover: {
      title: "Performance Metrics",
      description:
        "Get a high-level view of your lead generation performance and active monitors.",
      side: "top",
      align: "center",
    },
  },
  // Leads
  {
    index: 2,
    route: "/dashboard/leads",
    element: "#leads-view",
    popover: {
      title: "Your Leads",
      description: "Browse and filter the leads Leadly has found for you.",
      side: "top",
      align: "start",
    },
  },
  // ICPs
  {
    index: 3,
    route: "/dashboard/icps",
    element: "#create-icp-form",
    popover: {
      title: "Define Ideal Customers",
      description:
        "Create profiles for your target audience. This helps our AI score leads accurately.",
      side: "right",
      align: "start",
    },
  },
  {
    index: 4,
    route: "/dashboard/icps",
    element: "#icp-list",
    popover: {
      title: "Manage Profiles",
      description: "View and edit your existing Ideal Customer Profiles here.",
      side: "top",
      align: "start",
    },
  },
  // Monitors
  {
    index: 5,
    route: "/dashboard/monitors",
    element: "#create-monitor-form",
    popover: {
      title: "Add Monitors",
      description:
        "Tell Leadly where to look. Add subreddits or keywords linked to an ICP.",
      side: "right",
      align: "start",
    },
  },
  {
    index: 6,
    route: "/dashboard/monitors",
    element: "#monitor-list",
    popover: {
      title: "Active Monitors",
      description: "Track the status and performance of your active scrapes.",
      side: "top",
      align: "start",
    },
  },
  // Schedule
  {
    index: 7,
    route: "/dashboard/schedule",
    element: "#schedule-form",
    popover: {
      title: "Scrape Schedule",
      description:
        "Configure the exact hours you want Leadly to look for new posts.",
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
  // Final Welcome Step - Full screen overlay
  {
    index: 9,
    route: "/dashboard",
    // No element specified - creates full-screen centered modal
    popover: {
      title: "Ready to go!",
      description:
        "You are all set. Start by creating an ICP or setting up your first monitor.",
    },
  },
];

export function Walkthrough({
  hasSeenWalkthrough,
  hasCompletedOnboarding,
}: WalkthroughProps) {
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
    // Styling injection for app-like look
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

    // Only run lead gen walkthrough if in leadgen mode
    if (productMode !== "leadgen") {
      return;
    }

    // Don't start walkthrough until onboarding is complete
    const onboardingDone =
      hasCompletedOnboarding ||
      window.localStorage.getItem("leadly-onboarding-completed") === "true";
    if (!onboardingDone) {
      return;
    }

    // Check backend prop AND local storage to prevent optimistic restart loop
    // BUT allow restart if query param is present
    const urlParams = new URLSearchParams(window.location.search);
    const forceRestart = urlParams.get("walkthrough") === "restart";

    if (forceRestart) {
      // Clear the query param from URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    } else if (
      hasSeenWalkthrough ||
      window.localStorage.getItem("leadly-walkthrough-completed") === "true"
    ) {
      return;
    }

    // Retrieve storage state
    const storageKey = "leadly-walkthrough-step";
    const storedStepIndex = parseInt(
      window.sessionStorage.getItem(storageKey) || "0",
      10,
    );

    // If finished previously but session storage lingers, or backend mismatch
    if (storedStepIndex >= STEPS.length) {
      window.sessionStorage.removeItem(storageKey);
      return;
    }

    // Track whether this effect invocation is still active (not cleaned up)
    let isActive = true;

    // Helper: mark walkthrough as complete in backend + localStorage
    const markComplete = () => {
      clientApi.updateWalkthroughStatus().catch(console.error);
      window.localStorage.setItem("leadly-walkthrough-completed", "true");
      window.sessionStorage.removeItem(storageKey);
    };

    // Initialize driver
    driverObj.current = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: "Finish",
      nextBtnText: "Next",
      prevBtnText: "Previous",
      steps: STEPS.map((s) => ({
        element: s.element,
        popover: s.popover,
        // Pass custom metadata to access in callbacks
        index: s.index,
        route: s.route,
      })),
      onNextClick: (elem, step, opts) => {
        // Use the index from the step definition to avoid stale closure issues
        const currentIndex = (step as any).index as number;
        const nextIndex = currentIndex + 1;

        if (nextIndex >= STEPS.length) {
          driverObj.current?.destroy();
          return;
        }

        const nextStepConfig = STEPS[nextIndex];
        const currentPathname = pathnameRef.current;

        // Always scroll to top before processing next step to ensure clean positioning
        window.scrollTo(0, 0);

        // Check if route change is needed
        if (nextStepConfig.route !== currentPathname) {
          // Need to change route - store step, destroy driver, navigate
          window.sessionStorage.setItem(storageKey, nextIndex.toString());
          driverObj.current?.destroy(); // Tear down UI on this page
          router.push(nextStepConfig.route);
        } else {
          // Same page, just move
          window.sessionStorage.setItem(storageKey, nextIndex.toString());
          driverObj.current?.moveNext();
        }
      },
      onPrevClick: (elem, step, opts) => {
        const currentIndex = (step as any).index as number;
        const prevIndex = currentIndex - 1;

        if (prevIndex < 0) return;

        const prevStepConfig = STEPS[prevIndex];
        const currentPathname = pathnameRef.current;

        // Always scroll to top
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
          currentIndex < STEPS.length &&
          STEPS[currentIndex]?.route !== currentPathname;

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

    // Start the tour at the stored index
    // Check if we are on the correct page for this index
    const currentStepConfig = STEPS[storedStepIndex];
    if (currentStepConfig && currentStepConfig.route === pathname) {
      // Ensure scroll is at top before starting
      window.scrollTo(0, 0);

      // Give small delay for hydration/rendering.
      // increased to 800ms to be safe with page transitions.
      timeoutRef.current = setTimeout(() => {
        // Verify driver instance still exists and this effect is still active
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
  }, [
    hasSeenWalkthrough,
    hasCompletedOnboarding,
    productMode,
    pathname,
    router,
    searchParams,
  ]);

  return null;
}
