"use client";

import { useEffect, useState, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
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
    duration: 3000,
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
        ((currentStep * 100) / DEMO_STEPS.length) +
          (currentTick / ticksPerStep) * (100 / DEMO_STEPS.length)
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
            {currentStepData?.description}
          </p>
        </div>

        {/* Browser Frame */}
        <div className="relative mx-auto max-w-3xl">
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
                    app.leadly.io
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
              {/* Sidebar - Hidden on mobile */}
              <div className="bg-muted/10 hidden w-36 shrink-0 border-r p-3 sm:block lg:w-44 lg:p-4">
                {/* Logo */}
                <div className="mb-4 flex items-center gap-2 lg:mb-5">
                  <div className="bg-primary size-6 rounded-md lg:size-7" />
                  <span className="text-foreground text-sm font-medium lg:text-base">Leadly</span>
                </div>

                {/* Nav Items */}
                <nav className="space-y-0.5">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-all duration-300 lg:px-3 lg:py-2 lg:text-sm",
                        activeNavItem === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "size-1.5 rounded-full",
                        activeNavItem === item.id ? "bg-primary" : "bg-muted-foreground/30"
                      )} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-5">
                {/* Content Header with Step Indicator */}
                <div className="mb-4 flex items-center justify-between sm:mb-5">
                  <div>
                    <div className="text-muted-foreground mb-0.5 text-[10px] font-medium uppercase tracking-wider sm:text-xs">
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

                {/* Dynamic Step Content */}
                <div className="relative">
                  {/* Step 1: ICP Form */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      currentStep === 0
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-8 opacity-0 pointer-events-none"
                    )}
                  >
                    <IcpFormStep progress={stepProgress} />
                  </div>

                  {/* Step 2: Monitor Form */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      currentStep === 1
                        ? "translate-x-0 opacity-100"
                        : currentStep < 1
                        ? "translate-x-8 opacity-0 pointer-events-none"
                        : "-translate-x-8 opacity-0 pointer-events-none"
                    )}
                  >
                    <MonitorFormStep progress={stepProgress} />
                  </div>

                  {/* Step 3: Schedule */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      currentStep === 2
                        ? "translate-x-0 opacity-100"
                        : currentStep < 2
                        ? "translate-x-8 opacity-0 pointer-events-none"
                        : "-translate-x-8 opacity-0 pointer-events-none"
                    )}
                  >
                    <ScheduleStep progress={stepProgress} />
                  </div>

                  {/* Step 4: Leads Table */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      currentStep === 3
                        ? "translate-x-0 opacity-100"
                        : currentStep < 3
                        ? "translate-x-8 opacity-0 pointer-events-none"
                        : "-translate-x-8 opacity-0 pointer-events-none"
                    )}
                  >
                    <LeadsTableStep progress={stepProgress} />
                  </div>

                  {/* Step 5: Contact Lead */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      currentStep === 4
                        ? "translate-x-0 opacity-100"
                        : currentStep < 4
                        ? "translate-x-8 opacity-0 pointer-events-none"
                        : "-translate-x-8 opacity-0 pointer-events-none"
                    )}
                  >
                    <ContactStep progress={stepProgress} />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="border-t bg-muted/20 px-3 py-2 sm:px-4 sm:py-2.5">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Play/Pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-foreground text-background flex size-6 items-center justify-center rounded-full transition-transform hover:scale-105 sm:size-7"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="size-3 sm:size-3.5" />
                  ) : (
                    <Play className="ml-0.5 size-3 sm:size-3.5" />
                  )}
                </button>

                {/* Progress Bar */}
                <div className="bg-muted h-1 flex-1 overflow-hidden rounded-full sm:h-1.5">
                  <div
                    className="bg-primary h-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Restart */}
                <button
                  onClick={resetDemo}
                  className="text-muted-foreground hover:text-foreground flex size-6 items-center justify-center rounded-full transition-colors sm:size-7"
                  aria-label="Restart"
                >
                  <RotateCcw className="size-3 sm:size-3.5" />
                </button>

                {/* Step Dots - Hidden on mobile */}
                <div className="hidden gap-1 sm:flex">
                  {DEMO_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(index);
                        setStepProgress(0);
                      }}
                      className={cn(
                        "size-1.5 rounded-full transition-all",
                        index === currentStep
                          ? "bg-primary scale-125"
                          : index < currentStep
                          ? "bg-primary/40"
                          : "bg-muted-foreground/20"
                      )}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Step Components

function IcpFormStep({ progress }: { progress: number }) {
  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <h4 className="text-foreground text-sm font-medium sm:text-base">Define a new ICP</h4>
        <button
          className={cn(
            "text-primary border-primary/30 rounded-md border px-2 py-1 text-xs font-medium transition-all sm:px-3 sm:py-1.5 sm:text-sm",
            progress > 20 && "bg-primary/10 ring-1 ring-primary/30"
          )}
        >
          Use AI Help
        </button>
      </div>

      <div className="space-y-3">
        {/* Name Field */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            ICP Name
          </label>
          <div className="bg-input h-9 overflow-hidden rounded-md border px-3">
            <TypewriterText
              text="SaaS Founders looking for analytics tools"
              progress={progress}
              startAt={30}
            />
          </div>
        </div>

        {/* Summary Field */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            Summary
          </label>
          <div
            className={cn(
              "bg-input h-16 rounded-md border px-3 py-2",
              progress > 60 && "border-primary/50"
            )}
          >
            <div
              className={cn(
                "bg-muted h-2.5 w-3/4 rounded transition-all",
                progress > 65 && "bg-primary/30"
              )}
            />
            <div
              className={cn(
                "bg-muted mt-1.5 h-2.5 w-1/2 rounded transition-all",
                progress > 70 && "bg-primary/30"
              )}
            />
          </div>
        </div>
      </div>

      {/* Create Button */}
      <button
        className={cn(
          "bg-primary text-primary-foreground mt-3 w-full rounded-md py-1.5 text-xs font-medium transition-all sm:mt-4 sm:rounded-lg sm:py-2 sm:text-sm",
          progress > 85 && "ring-1 ring-primary/50"
        )}
      >
        Create ICP
      </button>
    </div>
  );
}

function MonitorFormStep({ progress }: { progress: number }) {
  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <h4 className="text-foreground mb-3 text-sm font-medium sm:mb-4 sm:text-base">Create new monitor</h4>

      <div className="space-y-2 sm:space-y-3">
        {/* ICP Select */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            Select ICP
          </label>
          <div
            className={cn(
              "bg-input flex h-9 items-center justify-between rounded-md border px-3 text-sm",
              progress > 15 && "border-primary/50"
            )}
          >
            <span
              className={cn(
                "text-muted-foreground transition-all",
                progress > 25 && "text-foreground"
              )}
            >
              {progress > 25 ? "SaaS Founders" : "Select an ICP..."}
            </span>
            <span className="text-muted-foreground">▼</span>
          </div>
        </div>

        {/* Subreddit Input */}
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            Target Subreddit
          </label>
          <div className="bg-input flex h-9 items-center rounded-md border px-3">
            <span className="text-muted-foreground mr-1">r/</span>
            <TypewriterText text="SaaS" progress={progress} startAt={40} />
          </div>
        </div>

        {/* AI Suggestions */}
        {progress > 55 && (
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
                      progress > 70 + i * 10 && "opacity-100 scale-100",
                      progress <= 70 + i * 10 && "opacity-0 scale-95"
                    )}
                  >
                    {sub}
                  </span>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <button
        className={cn(
          "bg-primary text-primary-foreground mt-3 w-full rounded-md py-1.5 text-xs font-medium transition-all sm:mt-4 sm:rounded-lg sm:py-2 sm:text-sm",
          progress > 90 && "ring-1 ring-primary/50"
        )}
      >
        Create monitor
      </button>
    </div>
  );
}

function ScheduleStep({ progress }: { progress: number }) {
  const hours = [
    "12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM",
  ];

  const selectedHours = progress > 30 ? [1, 3, 5] : progress > 15 ? [1, 3] : progress > 5 ? [1] : [];

  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <h4 className="text-foreground mb-1 text-sm font-medium sm:mb-2 sm:text-base">Scrape cadence</h4>
      <p className="text-muted-foreground mb-3 text-[10px] sm:mb-4 sm:text-xs">
        Select up to 6 unique hours for scraping.
      </p>

      <div className="mb-3 grid grid-cols-3 gap-1.5 sm:mb-4 sm:gap-2">
        {hours.map((hour, i) => (
          <div
            key={hour}
            className={cn(
              "rounded-md border px-2 py-1.5 text-center text-xs transition-all duration-300 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm",
              selectedHours.includes(i)
                ? "bg-primary/15 border-primary/50 text-primary font-medium"
                : "bg-input text-muted-foreground"
            )}
          >
            {hour}
          </div>
        ))}
      </div>

      <div className="text-muted-foreground mb-3 flex items-center justify-between text-[10px] sm:mb-4 sm:text-xs">
        <span>{selectedHours.length}/6 hours selected</span>
        <span className="text-primary">PRO Plan</span>
      </div>

      <button
        className={cn(
          "bg-primary text-primary-foreground w-full rounded-md py-1.5 text-xs font-medium transition-all sm:rounded-lg sm:py-2 sm:text-sm",
          progress > 85 && "ring-1 ring-primary/50"
        )}
      >
        Save schedule
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
        <div className="grid grid-cols-12 gap-1 text-[10px] font-medium text-muted-foreground sm:gap-2 sm:text-xs">
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
              i === 0 && progress > 70 && "bg-primary/5"
            )}
          >
            <div className="col-span-4 font-medium text-foreground truncate sm:col-span-3">
              {lead.name}
            </div>
            <div className="col-span-3 sm:col-span-2">
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs",
                  typeStyles[lead.type]
                )}
              >
                {lead.type}
              </span>
            </div>
            <div className="col-span-5 hidden text-muted-foreground truncate sm:block">
              {lead.topic}
            </div>
            <div className="col-span-5 sm:col-span-2">
              <span className="text-[10px] text-muted-foreground sm:text-xs">New</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactStep({ progress }: { progress: number }) {
  const showDropdown = progress > 40 && progress < 80;
  const showContacted = progress >= 80;

  return (
    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div>
          <h4 className="text-foreground text-sm font-medium sm:text-base">u/startup_dev</h4>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            Looking for analytics solution
          </p>
        </div>
        <span className="bg-primary/15 text-primary rounded-full border border-primary/20 px-2 py-0.5 text-[10px] font-medium sm:px-3 sm:py-1 sm:text-xs">
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
            (showDropdown || showContacted) && "border-primary/50"
          )}
        >
          <span
            className={cn(
              showContacted ? "text-emerald-600 font-medium" : "text-foreground"
            )}
          >
            {showContacted ? "Contacted" : "New"}
          </span>
          <span className="text-muted-foreground text-[10px] sm:text-sm">▼</span>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="animate-in fade-in slide-in-from-top-2 bg-popover absolute top-full left-0 right-0 z-10 mt-1 rounded-md border p-1 shadow-lg">
            {["New", "Viewed", "Contacted", "Archived"].map((status) => (
              <div
                key={status}
                className={cn(
                  "rounded px-2 py-1 text-xs cursor-pointer hover:bg-muted sm:px-3 sm:py-1.5 sm:text-sm",
                  status === "Contacted" && "bg-primary/10 text-primary"
                )}
              >
                {status}
              </div>
            ))}
          </div>
        )}
      </div>

      {showContacted && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-center text-xs text-emerald-700 dark:text-emerald-400 sm:mt-4 sm:rounded-lg sm:p-3 sm:text-sm">
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
}: {
  text: string;
  progress: number;
  startAt?: number;
}) {
  const adjustedProgress = Math.max(0, progress - startAt);
  const maxProgress = 100 - startAt;
  const charsToShow = Math.floor((adjustedProgress / maxProgress) * text.length);

  return (
    <span className="text-foreground flex h-full items-center text-sm">
      {text.slice(0, charsToShow)}
      {adjustedProgress > 0 && adjustedProgress < maxProgress && (
        <span className="bg-foreground ml-0.5 h-4 w-0.5 animate-pulse" />
      )}
    </span>
  );
}
