"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useRouter, usePathname } from "next/navigation";
import { clientApi } from "@/lib/client/api";

interface WalkthroughProps {
  hasSeenWalkthrough: boolean;
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

export function Walkthrough({ hasSeenWalkthrough }: WalkthroughProps) {
  const driverObj = useRef<Driver | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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

    // Check backend prop AND local storage to prevent optimistic restart loop
    if (
      hasSeenWalkthrough ||
      window.localStorage.getItem("leadly-walkthrough-completed") === "true"
    )
      return;

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

        // Always scroll to top before processing next step to ensure clean positioning
        window.scrollTo(0, 0);

        // Check if route change is needed
        if (nextStepConfig.route !== pathname) {
          // Need to change route
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

        // Always scroll to top
        window.scrollTo(0, 0);

        if (prevStepConfig.route !== pathname) {
          window.sessionStorage.setItem(storageKey, prevIndex.toString());
          driverObj.current?.destroy();
          router.push(prevStepConfig.route);
        } else {
          window.sessionStorage.setItem(storageKey, prevIndex.toString());
          driverObj.current?.movePrevious();
        }
      },
      onDestroyed: () => {
        // Check if we are really done (i.e. user clicked "Finish" or "Skip" or "Close")
        const currentIndex = parseInt(
          window.sessionStorage.getItem(storageKey) || "0",
          10,
        );

        // Only mark as complete if we're on the last step AND we're on the final route
        // This prevents marking as complete when navigating TO the final step
        if (
          currentIndex >= STEPS.length - 1 &&
          pathname === STEPS[STEPS.length - 1]?.route
        ) {
          clientApi.updateWalkthroughStatus().catch(console.error);
          window.localStorage.setItem("leadly-walkthrough-completed", "true");
          window.sessionStorage.removeItem(storageKey);
        }
        // Otherwise, we're just navigating and the tour will resume on the next page
      },
      onCloseClick: () => {
        // Explicit close/skip
        clientApi.updateWalkthroughStatus().catch(console.error);
        window.localStorage.setItem("leadly-walkthrough-completed", "true");
        window.sessionStorage.removeItem(storageKey);
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
      setTimeout(() => {
        // Verify driver instance still exists (component didn't unmount in the meantime)
        if (driverObj.current) {
          driverObj.current.drive(storedStepIndex);
        }
      }, 800);
    }

    return () => {
      // Cleanup not typically needed as driver cleanup is handled via destroy
    };
  }, [hasSeenWalkthrough, pathname, router]);

  return null;
}
