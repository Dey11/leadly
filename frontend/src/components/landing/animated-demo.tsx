"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Demo steps configuration
const DEMO_STEPS = [
  {
    id: 1,
    title: "Define Your ICP",
    description: "Create an Ideal Customer Profile with AI assistance",
    duration: 3000,
    navItem: "icps",
  },
  {
    id: 2,
    title: "Create a Monitor",
    description: "Target specific subreddits for your ICP",
    duration: 3500, // Slightly longer
    navItem: "monitors",
  },
  {
    id: 3,
    title: "Set Your Schedule",
    description: "Choose when Leadly scrapes for leads",
    duration: 3000,
    navItem: "schedule",
  },
  {
    id: 4,
    title: "View Your Leads",
    description: "See categorized leads: Warm, Neutral, Cold",
    duration: 3000,
    navItem: "leads",
  },
  {
    id: 5,
    title: "Take Action",
    description: "Contact leads and track progress",
    duration: 3000,
    navItem: "leads",
  },
] as const;

const TOTAL_DURATION = DEMO_STEPS.reduce((acc, step) => acc + step.duration, 0);

// Navigation items for sidebar - using simple icons
const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "icps", label: "ICPs" },
  { id: "monitors", label: "Monitors" },
  { id: "leads", label: "Leads" },
  { id: "schedule", label: "Schedule" },
];

export function AnimatedDemo() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setProgress(0);
    setStepProgress(0);
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const stepDuration = DEMO_STEPS[currentStep]?.duration || 3000;
    const tickInterval = 50; // Update every 50ms for smooth animation
    const ticksPerStep = stepDuration / tickInterval;
    let currentTick = 0;

    const timer = setInterval(() => {
      currentTick++;
      setStepProgress((currentTick / ticksPerStep) * 100);
      setProgress(
        (currentStep * 100) / DEMO_STEPS.length +
          (currentTick / ticksPerStep) * (100 / DEMO_STEPS.length),
      );

      if (currentTick >= ticksPerStep) {
        if (currentStep < DEMO_STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setStepProgress(0);
          currentTick = 0;
        } else {
          // Loop back to start
          setCurrentStep(0);
          setStepProgress(0);
          setProgress(0);
          currentTick = 0;
        }
      }
    }, tickInterval);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep]);

  const activeNavItem = DEMO_STEPS[currentStep]?.navItem || "overview";
  const currentStepData = DEMO_STEPS[currentStep];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            See how it works
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Watch Leadly find and categorize your ideal leads in minutes
          </p>
        </div>

        {/* Browser Frame */}
        <div className="relative mx-auto max-w-4xl">
          {/* Browser Window */}
          <div className="bg-card overflow-hidden rounded-xl border shadow-xl sm:rounded-2xl">
            {/* Browser Header */}
            <div className="bg-muted/30 border-b px-3 py-2 sm:px-4 sm:py-2.5">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Traffic Lights */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="size-2.5 rounded-full bg-[#ff5f57] sm:size-3" />
                  <div className="size-2.5 rounded-full bg-[#febc2e] sm:size-3" />
                  <div className="size-2.5 rounded-full bg-[#28c840] sm:size-3" />
                </div>
                {/* URL Bar */}
                <div className="bg-background/60 flex-1 rounded-md px-3 py-1 sm:py-1.5">
                  <span className="text-muted-foreground text-xs sm:text-sm">
                    leadly.tryhanabi.com
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
              {/* Sidebar - Hidden on mobile */}
              <div className="bg-muted/10 hidden w-14 shrink-0 border-r py-3 sm:block lg:w-16">
                {/* Leadly Logo */}
                <div className="mb-3 flex justify-center">
                  <div className="relative size-7 lg:size-8">
                    <Image
                      src="/assets/logo.svg"
                      alt="Leadly"
                      fill
                      className="object-contain dark:hidden"
                    />
                    <Image
                      src="/assets/logo-dark.svg"
                      alt="Leadly"
                      fill
                      className="hidden object-contain dark:block"
                    />
                  </div>
                </div>
                {/* Nav Items */}
                <nav className="flex flex-col items-center gap-1.5">
                  {NAV_ITEMS.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "size-7 rounded-md transition-all duration-300 lg:size-8",
                        activeNavItem === item.id
                          ? "bg-primary/15"
                          : "bg-muted/40",
                      )}
                    />
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-5">
                {/* Content Header with Step Indicator */}
                <div className="mb-4 flex items-center justify-between sm:mb-5">
                  <div>
                    <div className="text-muted-foreground mb-0.5 text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                      Step {currentStep + 1} of {DEMO_STEPS.length}
                    </div>
                    <h3 className="text-foreground text-sm font-medium sm:text-base lg:text-lg">
                      {currentStepData?.title}
                    </h3>
                  </div>
                  <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-sm font-semibold shadow sm:size-8 sm:text-base">
                    {currentStep + 1}
                  </div>
                </div>

                {/* Dynamic Step Content - key forces animation on step change */}
                <div className="relative">
                  <div
                    key={currentStep}
                    className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500 ease-out"
                  >
                    {currentStep === 0 && (
                      <IcpFormStep progress={stepProgress} />
                    )}
                    {currentStep === 1 && (
                      <MonitorFormStep progress={stepProgress} />
                    )}
                    {currentStep === 2 && (
                      <ScheduleStep progress={stepProgress} />
                    )}
                    {currentStep === 3 && (
                      <LeadsTableStep progress={stepProgress} />
                    )}
                    {currentStep === 4 && (
                      <ContactStep progress={stepProgress} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Step Description - Below video */}
        <p className="text-muted-foreground mt-4 text-center text-sm sm:mt-6 sm:text-base">
          {currentStepData?.description}
        </p>
      </div>
    </section>
  );
}

// Step Components

function IcpFormStep({ progress }: { progress: number }) {
  // Button states: normal -> clicked (75%) -> creating (85%)
  const isButtonClicked = progress > 75 && progress <= 88;
  const isCreating = progress > 88;

  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h4 className="text-foreground text-sm font-medium sm:text-base">
          Define a new ICP
        </h4>
        <button
          className={cn(
            "text-primary border-primary/30 rounded-md border px-2 py-1 text-xs font-medium transition-all sm:px-3 sm:py-1.5 sm:text-sm",
            progress > 10 &&
              progress < 25 &&
              "bg-primary/10 ring-primary/30 ring-1",
          )}
        >
          Use AI Help
        </button>
      </div>

      <div className="space-y-3">
        {/* Name Field - Types from 5% to 55% */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            ICP Name
          </label>
          <div
            className={cn(
              "bg-input h-9 overflow-hidden rounded-md border px-3",
              progress > 5 && progress < 60 && "border-primary/50",
            )}
          >
            <TypewriterText
              text="SaaS Founders looking for analytics tools"
              progress={progress}
              startAt={5}
              endAt={55}
            />
          </div>
        </div>

        {/* Summary Field - Fills at 60% */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            Summary
          </label>
          <div
            className={cn(
              "bg-input h-16 rounded-md border px-3 py-2",
              progress > 55 && progress < 75 && "border-primary/50",
            )}
          >
            <div
              className={cn(
                "bg-muted h-2.5 w-3/4 rounded transition-all",
                progress > 58 && "bg-primary/30",
              )}
            />
            <div
              className={cn(
                "bg-muted mt-1.5 h-2.5 w-1/2 rounded transition-all",
                progress > 62 && "bg-primary/30",
              )}
            />
          </div>
        </div>
      </div>

      {/* Create Button - Clicked at 75%, Creating at 85% */}
      <button
        className={cn(
          "bg-primary text-primary-foreground mt-3 w-full rounded-md py-1.5 text-xs font-medium transition-all sm:mt-4 sm:rounded-lg sm:py-2 sm:text-sm",
          isButtonClicked &&
            "ring-primary/50 scale-[0.975] ring-2 brightness-90",
          isCreating && "scale-100",
        )}
      >
        <span className="inline-flex items-center justify-center gap-1.5">
          <span
            className={cn(
              "size-3 rounded-full border-2 border-current border-t-transparent transition-opacity",
              isCreating ? "animate-spin opacity-100" : "w-0 opacity-0",
            )}
          />
          {isCreating ? "Creating..." : "Create ICP"}
        </span>
      </button>
    </div>
  );
}

function MonitorFormStep({ progress }: { progress: number }) {
  // Button states: normal -> clicked (75%) -> creating (85%)
  const isButtonClicked = progress > 75 && progress <= 88;
  const isCreating = progress > 88;

  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <h4 className="text-foreground mb-3 text-sm font-medium sm:mb-4 sm:text-base">
        Create new monitor
      </h4>

      <div className="space-y-2 sm:space-y-3">
        {/* ICP Select - Selects at 10% */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            Select ICP
          </label>
          <div
            className={cn(
              "bg-input flex h-9 items-center justify-between rounded-md border px-3 text-sm",
              progress > 5 && progress < 20 && "border-primary/50",
            )}
          >
            <span
              className={cn(
                "text-muted-foreground transition-all",
                progress > 10 && "text-foreground",
              )}
            >
              {progress > 10 ? "SaaS Founders" : "Select an ICP..."}
            </span>
            <span className="text-muted-foreground">▼</span>
          </div>
        </div>

        {/* Subreddit Input - Types from 20% to 40% */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            Target Subreddit
          </label>
          <div
            className={cn(
              "bg-input flex h-9 items-center rounded-md border px-3",
              progress > 20 && progress < 50 && "border-primary/50",
            )}
          >
            <span className="text-muted-foreground mr-1">r/</span>
            <TypewriterText
              text="SaaS"
              progress={progress}
              startAt={20}
              endAt={40}
            />
          </div>
        </div>

        {/* AI Suggestions - Appear at 45% */}
        {progress > 45 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-muted-foreground mb-2 text-xs">
              AI Suggested Subreddits:
            </div>
            <div className="flex flex-wrap gap-2">
              {["r/startups", "r/entrepreneur", "r/SideProject"].map(
                (sub, i) => (
                  <span
                    key={sub}
                    className={cn(
                      "bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium transition-all",
                      progress > 48 + i * 5 && "scale-100 opacity-100",
                      progress <= 48 + i * 5 && "scale-95 opacity-0",
                    )}
                  >
                    {sub}
                  </span>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Button - Clicked at 75%, Creating at 85% */}
      <button
        className={cn(
          "bg-primary text-primary-foreground mt-3 w-full rounded-md py-1.5 text-xs font-medium transition-all sm:mt-4 sm:rounded-lg sm:py-2 sm:text-sm",
          isButtonClicked &&
            "ring-primary/50 scale-[0.975] ring-2 brightness-90",
          isCreating && "scale-100",
        )}
      >
        <span className="inline-flex items-center justify-center gap-1.5">
          <span
            className={cn(
              "size-3 rounded-full border-2 border-current border-t-transparent transition-opacity",
              isCreating ? "animate-spin opacity-100" : "w-0 opacity-0",
            )}
          />
          {isCreating ? "Creating..." : "Create monitor"}
        </span>
      </button>
    </div>
  );
}

function ScheduleStep({ progress }: { progress: number }) {
  const hours = ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"];

  // Calculate which hours are selected and which is being "clicked"
  const selectedHours =
    progress > 30
      ? [1, 3, 5]
      : progress > 15
        ? [1, 3]
        : progress > 5
          ? [1]
          : [];

  // Determine which hour is being "clicked" right now (showing click animation)
  const clickingHour =
    progress > 3 && progress <= 8
      ? 1 // About to select 4 AM
      : progress > 13 && progress <= 18
        ? 3 // About to select 12 PM
        : progress > 28 && progress <= 33
          ? 5 // About to select 8 PM
          : null;

  // Button states: normal -> clicked (75%) -> saving (88%)
  const isButtonClicked = progress > 75 && progress <= 88;
  const isSaving = progress > 88;

  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <h4 className="text-foreground mb-1 text-sm font-medium sm:mb-2 sm:text-base">
        Scrape cadence
      </h4>
      <p className="text-muted-foreground mb-3 text-[10px] sm:mb-4 sm:text-xs">
        Select up to 6 unique hours for scraping.
      </p>

      <div className="mb-3 grid grid-cols-3 gap-1.5 sm:mb-4 sm:gap-2">
        {hours.map((hour, i) => {
          const isSelected = selectedHours.includes(i);
          const isBeingClicked = clickingHour === i;

          return (
            <div
              key={hour}
              className={cn(
                "rounded-md border px-2 py-1.5 text-center text-xs transition-all duration-200 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm",
                isSelected
                  ? "bg-primary/15 border-primary/50 text-primary font-medium"
                  : "bg-input text-muted-foreground",
                isBeingClicked && "border-primary bg-primary/10",
              )}
            >
              {hour}
            </div>
          );
        })}
      </div>

      <div className="text-muted-foreground mb-3 flex items-center justify-between text-[10px] sm:mb-4 sm:text-xs">
        <span>{selectedHours.length}/6 hours selected</span>
        <span className="text-primary">PRO Plan</span>
      </div>

      {/* Save Button - Clicked at 75%, Saving at 88% */}
      <button
        className={cn(
          "bg-primary text-primary-foreground w-full rounded-md py-1.5 text-xs font-medium transition-all sm:rounded-lg sm:py-2 sm:text-sm",
          isButtonClicked &&
            "ring-primary/50 scale-[0.975] ring-2 brightness-90",
          isSaving && "scale-100",
        )}
      >
        <span className="inline-flex items-center justify-center gap-1.5">
          <span
            className={cn(
              "size-3 rounded-full border-2 border-current border-t-transparent transition-opacity",
              isSaving ? "animate-spin opacity-100" : "w-0 opacity-0",
            )}
          />
          {isSaving ? "Saving..." : "Save schedule"}
        </span>
      </button>
    </div>
  );
}

function LeadsTableStep({ progress }: { progress: number }) {
  const leads = [
    { name: "u/startup_dev", type: "WARM", topic: "Looking for analytics" },
    { name: "u/saas_jenny", type: "WARM", topic: "Need help tracking" },
    { name: "u/founder_mike", type: "NEUTRAL", topic: "Comparing tools" },
    { name: "u/tech_sam", type: "COLD", topic: "General discussion" },
  ];

  const typeStyles: Record<string, string> = {
    WARM: "bg-primary/15 text-primary border-primary/20",
    NEUTRAL: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
    COLD: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Table Header */}
      <div className="border-b px-2 py-2 sm:px-4 sm:py-2.5">
        <div className="text-muted-foreground grid grid-cols-12 gap-1 text-[10px] font-medium sm:gap-2 sm:text-xs">
          <div className="col-span-4 sm:col-span-3">User</div>
          <div className="col-span-3 sm:col-span-2">Type</div>
          <div className="col-span-5 hidden sm:block">Topic</div>
          <div className="col-span-5 sm:col-span-2">Status</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y">
        {leads.map((lead, i) => (
          <div
            key={lead.name}
            className={cn(
              "grid grid-cols-12 gap-1 px-2 py-2 text-xs transition-all duration-300 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm",
              progress > 20 + i * 15 ? "opacity-100" : "opacity-0",
              i === 0 && progress > 70 && "bg-primary/5",
            )}
          >
            <div className="text-foreground col-span-4 truncate font-medium sm:col-span-3">
              {lead.name}
            </div>
            <div className="col-span-3 sm:col-span-2">
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs",
                  typeStyles[lead.type],
                )}
              >
                {lead.type}
              </span>
            </div>
            <div className="text-muted-foreground col-span-5 hidden truncate sm:block">
              {lead.topic}
            </div>
            <div className="col-span-5 sm:col-span-2">
              <span className="text-muted-foreground text-[10px] sm:text-xs">
                New
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactStep({ progress }: { progress: number }) {
  const showDropdown = progress > 40 && progress < 75;
  const isClickingContacted = progress > 65 && progress < 75; // About to click Contacted
  const showContacted = progress >= 75;

  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div>
          <h4 className="text-foreground text-sm font-medium sm:text-base">
            u/startup_dev
          </h4>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            Looking for analytics solution
          </p>
        </div>
        <span className="bg-primary/15 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-[10px] font-medium sm:px-3 sm:py-1 sm:text-xs">
          WARM
        </span>
      </div>

      <div className="bg-muted/50 mb-3 rounded-md p-2 sm:mb-4 sm:rounded-lg sm:p-3">
        <p className="text-foreground text-xs sm:text-sm">
          "We've been struggling to find a good analytics tool for our SaaS..."
        </p>
        <a
          href="#"
          className="text-primary mt-1.5 inline-block text-[10px] hover:underline sm:mt-2 sm:text-xs"
        >
          View full post on Reddit
        </a>
      </div>

      {/* Status Dropdown */}
      <div className="relative">
        <label className="text-muted-foreground mb-1 block text-[10px] sm:text-xs">
          Lead Status
        </label>
        <div
          className={cn(
            "bg-input flex h-7 items-center justify-between rounded-md border px-2 text-xs transition-all sm:h-9 sm:px-3 sm:text-sm",
            (showDropdown || showContacted) && "border-primary/50",
          )}
        >
          <span
            className={cn(
              showContacted
                ? "font-medium text-emerald-600"
                : "text-foreground",
            )}
          >
            {showContacted ? "Contacted" : "New"}
          </span>
          {/* Chevron - rotates when dropdown is open */}
          <span
            className={cn(
              "text-muted-foreground text-[10px] transition-transform duration-200 sm:text-sm",
              showDropdown && "rotate-180",
            )}
          >
            ▼
          </span>
        </div>

        {/* Dropdown - opens upward to avoid cutoff */}
        {showDropdown && (
          <div className="animate-in fade-in slide-in-from-bottom-2 bg-popover absolute right-0 bottom-full left-0 z-10 mb-1 rounded-md border p-1 shadow-lg">
            {["New", "Viewed", "Contacted", "Archived"].map((status) => (
              <div
                key={status}
                className={cn(
                  "hover:bg-muted cursor-pointer rounded px-2 py-1 text-xs transition-all sm:px-3 sm:py-1.5 sm:text-sm",
                  status === "Contacted" && "bg-primary/10 text-primary",
                  status === "Contacted" &&
                    isClickingContacted &&
                    "ring-primary/50 scale-[0.975] ring-2",
                )}
              >
                {status}
              </div>
            ))}
          </div>
        )}
      </div>

      {showContacted && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-center text-xs text-emerald-700 sm:mt-4 sm:rounded-lg sm:p-3 sm:text-sm dark:text-emerald-400">
          Lead marked as contacted
        </div>
      )}
    </div>
  );
}

// Helper component for typewriter effect
function TypewriterText({
  text,
  progress,
  startAt = 0,
  endAt = 100,
}: {
  text: string;
  progress: number;
  startAt?: number;
  endAt?: number;
}) {
  const duration = endAt - startAt;
  const adjustedProgress = Math.max(0, Math.min(progress - startAt, duration));
  const charsToShow = Math.floor((adjustedProgress / duration) * text.length);
  const isComplete = progress >= endAt;

  return (
    <span className="text-foreground flex h-full items-center text-sm">
      {text.slice(0, charsToShow)}
      {adjustedProgress > 0 && !isComplete && (
        <span className="bg-foreground ml-0.5 h-4 w-0.5 animate-pulse" />
      )}
    </span>
  );
}
