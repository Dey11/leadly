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

// Navigation items for sidebar
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "⬜" },
  { id: "icps", label: "ICPs", icon: "📋" },
  { id: "monitors", label: "Monitors", icon: "📡" },
  { id: "leads", label: "Leads", icon: "✨" },
  { id: "schedule", label: "Schedule", icon: "🕐" },
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
    <section className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-12">
          <span className="text-primary mb-3 inline-block text-sm font-semibold uppercase tracking-wider">
            See It In Action
          </span>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How Leadly Works
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Watch how easy it is to find and manage Reddit leads
          </p>
        </div>

        {/* Browser Frame */}
        <div className="relative mx-auto max-w-4xl">
          {/* Browser Window */}
          <div className="bg-card overflow-hidden rounded-xl border shadow-2xl">
            {/* Browser Header */}
            <div className="bg-muted/50 border-b px-4 py-3">
              <div className="flex items-center gap-4">
                {/* Traffic Lights */}
                <div className="flex gap-2">
                  <div className="size-3 rounded-full bg-[#ff5f57]" />
                  <div className="size-3 rounded-full bg-[#febc2e]" />
                  <div className="size-3 rounded-full bg-[#28c840]" />
                </div>
                {/* URL Bar */}
                <div className="bg-background flex-1 rounded-md px-4 py-1.5 text-center">
                  <span className="text-muted-foreground text-sm">
                    app.leadly.io/dashboard
                  </span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex h-[400px] sm:h-[450px] lg:h-[500px]">
              {/* Sidebar */}
              <div className="bg-sidebar hidden w-48 shrink-0 border-r p-4 md:block">
                {/* Logo */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="bg-primary size-8 rounded-lg" />
                  <span className="text-foreground font-semibold">Leadly</span>
                </div>

                {/* Nav Items */}
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                        activeNavItem === item.id
                          ? "bg-primary/15 text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {activeNavItem === item.id && (
                        <div className="bg-primary ml-auto size-2 animate-pulse rounded-full" />
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-hidden p-4 sm:p-6">
                {/* Content Header with Step Indicator */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                      Step {currentStep + 1} of {DEMO_STEPS.length}
                    </div>
                    <h3 className="text-foreground text-lg font-semibold sm:text-xl">
                      {currentStepData?.title}
                    </h3>
                  </div>
                  <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full text-lg font-bold shadow-lg">
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

            {/* Progress Bar & Controls */}
            <div className="border-t bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-4">
                {/* Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex size-8 items-center justify-center rounded-full transition-colors"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={resetDemo}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex size-8 items-center justify-center rounded-full transition-colors"
                    aria-label="Restart"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Step Dots */}
                <div className="flex gap-1.5">
                  {DEMO_STEPS.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(index);
                        setStepProgress(0);
                      }}
                      className={cn(
                        "size-2.5 rounded-full transition-all",
                        index === currentStep
                          ? "bg-primary scale-125"
                          : index < currentStep
                          ? "bg-primary/50"
                          : "bg-muted-foreground/30"
                      )}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Step Description */}
              <p className="text-muted-foreground mt-2 text-center text-sm">
                {currentStepData?.description}
              </p>
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
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-foreground font-medium">Define a new ICP</h4>
        <button
          className={cn(
            "text-primary border-primary/30 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
            progress > 20 && "bg-primary/10 ring-2 ring-primary/30"
          )}
        >
          ✨ Use AI Help
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
          "bg-primary text-primary-foreground mt-4 w-full rounded-lg py-2 text-sm font-medium transition-all",
          progress > 85 && "ring-2 ring-primary/50 scale-[1.02]"
        )}
      >
        Create ICP
      </button>
    </div>
  );
}

function MonitorFormStep({ progress }: { progress: number }) {
  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <h4 className="text-foreground mb-4 font-medium">Create new monitor</h4>

      <div className="space-y-3">
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
          "bg-primary text-primary-foreground mt-4 w-full rounded-lg py-2 text-sm font-medium transition-all",
          progress > 90 && "ring-2 ring-primary/50 scale-[1.02]"
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
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <h4 className="text-foreground mb-2 font-medium">Scrape cadence</h4>
      <p className="text-muted-foreground mb-4 text-xs">
        Select up to 6 unique hours. Leadly will scrape your monitors at these times.
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {hours.map((hour, i) => (
          <div
            key={hour}
            className={cn(
              "rounded-lg border px-3 py-2 text-center text-sm transition-all duration-300",
              selectedHours.includes(i)
                ? "bg-primary/15 border-primary/50 text-primary font-medium"
                : "bg-input text-muted-foreground"
            )}
          >
            {hour}
          </div>
        ))}
      </div>

      <div className="text-muted-foreground mb-4 flex items-center justify-between text-xs">
        <span>{selectedHours.length}/6 hours selected</span>
        <span className="text-primary">PRO Plan</span>
      </div>

      <button
        className={cn(
          "bg-primary text-primary-foreground w-full rounded-lg py-2 text-sm font-medium transition-all",
          progress > 85 && "ring-2 ring-primary/50 scale-[1.02]"
        )}
      >
        Save schedule
      </button>
    </div>
  );
}

function LeadsTableStep({ progress }: { progress: number }) {
  const leads = [
    { name: "u/startup_dev", type: "WARM", topic: "Looking for analytics solution" },
    { name: "u/saas_jenny", type: "WARM", topic: "Need help tracking metrics" },
    { name: "u/founder_mike", type: "NEUTRAL", topic: "Comparing dashboard tools" },
    { name: "u/tech_lead_sam", type: "COLD", topic: "General SaaS discussion" },
  ];

  const typeStyles: Record<string, string> = {
    WARM: "bg-primary/15 text-primary border-primary/20",
    NEUTRAL: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
    COLD: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Table Header */}
      <div className="border-b px-4 py-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-3">User</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-5">Topic</div>
          <div className="col-span-2">Status</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y">
        {leads.map((lead, i) => (
          <div
            key={lead.name}
            className={cn(
              "grid grid-cols-12 gap-2 px-4 py-3 text-sm transition-all duration-300",
              progress > 20 + i * 15 ? "opacity-100" : "opacity-0",
              i === 0 && progress > 70 && "bg-primary/5"
            )}
          >
            <div className="col-span-3 font-medium text-foreground truncate">
              {lead.name}
            </div>
            <div className="col-span-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                  typeStyles[lead.type]
                )}
              >
                {lead.type}
              </span>
            </div>
            <div className="col-span-5 text-muted-foreground truncate">
              {lead.topic}
            </div>
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground">New</span>
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
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-foreground font-medium">u/startup_dev</h4>
          <p className="text-muted-foreground text-xs">
            Looking for analytics solution
          </p>
        </div>
        <span className="bg-primary/15 text-primary rounded-full border border-primary/20 px-3 py-1 text-xs font-medium">
          WARM
        </span>
      </div>

      <div className="bg-muted/50 mb-4 rounded-lg p-3">
        <p className="text-foreground text-sm">
          "We've been struggling to find a good analytics tool for our SaaS.
          Something that integrates well and doesn't break the bank..."
        </p>
        <a
          href="#"
          className="text-primary mt-2 inline-block text-xs hover:underline"
        >
          View full post on Reddit →
        </a>
      </div>

      {/* Status Dropdown */}
      <div className="relative">
        <label className="text-muted-foreground mb-1 block text-xs">
          Lead Status
        </label>
        <div
          className={cn(
            "bg-input flex h-9 items-center justify-between rounded-md border px-3 text-sm transition-all",
            (showDropdown || showContacted) && "border-primary/50"
          )}
        >
          <span
            className={cn(
              showContacted ? "text-emerald-600 font-medium" : "text-foreground"
            )}
          >
            {showContacted ? "✓ Contacted" : "New"}
          </span>
          <span className="text-muted-foreground">▼</span>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="animate-in fade-in slide-in-from-top-2 bg-popover absolute top-full left-0 right-0 z-10 mt-1 rounded-md border p-1 shadow-lg">
            {["New", "Viewed", "Contacted", "Archived"].map((status) => (
              <div
                key={status}
                className={cn(
                  "rounded px-3 py-1.5 text-sm cursor-pointer hover:bg-muted",
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
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
          ✓ Lead marked as contacted!
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
