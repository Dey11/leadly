"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { useProductMode } from "@/components/dashboard/product-mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUtcHourAsLocal } from "@/lib/format";

type ScheduleFormProps = {
  scheduledHours: number[];
  maxSelectable: number;
};

export function ScheduleForm({
  scheduledHours,
  maxSelectable,
}: ScheduleFormProps) {
  const [productMode] = useProductMode();
  
  // Initialize with UTC hours directly - no conversion needed for state
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(scheduledHours),
  );
  const [limitReached, setLimitReached] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (selected.size === 0) {
        throw new Error("Select at least one hour.");
      }
      // Since 'selected' already contains UTC hours, we just send them as is
      const utcHours = Array.from(selected.values());
      const payload = { scheduledHours: utcHours.sort((a, b) => a - b) };
      
      // Call the correct API based on product mode
      if (productMode === "keyword") {
        return clientApi.updateKeywordSchedule(payload);
      }
      return clientApi.updateSchedule(payload);
    },
    onSuccess: () => {
      setSuccessMessage(
        "Schedule updated. Your next scrape will follow this cadence.",
      );
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setSuccessMessage(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save schedule.",
      );
    },
  });

  const utcHours = useMemo(
    () => Array.from({ length: 24 }, (_, index) => index),
    [],
  );

  const toggleHour = (hour: number, checked: boolean) => {
    const next = new Set(selected);
    if (checked) {
      if (selected.size >= maxSelectable) {
        setLimitReached(true);
        return;
      }
      next.add(hour);
    } else {
      next.delete(hour);
    }
    setLimitReached(false);
    setSelected(next);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <Card className="bg-background/80">
      <CardHeader>
        <CardTitle>Scrape cadence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Select up to {maxSelectable} unique hours in your local timezone.
          Leadly will scrape your monitors at these times.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-4">
            {utcHours.map((utcHour) => {
              const isChecked = selected.has(utcHour);
              // Format the UTC hour as local time for display
              // This handles half-hour timezones correctly (e.g. 12 UTC -> 17:30 IST)
              const date = new Date();
              date.setUTCHours(utcHour, 0, 0, 0);
              
              // Shift label by 30 mins for keyword mode to match execution time (xx:30)
              if (productMode === "keyword") {
                date.setMinutes(date.getMinutes() + 30);
              }

              const localLabel = new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }).format(date);

              return (
                <label
                  key={utcHour}
                  className={`border-border/60 bg-card/80 flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-colors select-none ${
                    isChecked
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "hover:border-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={(event) =>
                      toggleHour(utcHour, event.currentTarget.checked)
                    }
                  />
                  <span className="text-sm font-medium">{localLabel}</span>
                </label>
              );
            })}
          </div>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>
              {selected.size}/{maxSelectable} hours selected
            </span>
            {limitReached && (
              <span className="text-destructive">
                Limit reached. Deselect an hour before adding another. Free
                users only get 1 uneditable hour.
              </span>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Unable to save schedule</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <AlertTitle>Schedule updated</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating schedule..." : "Save schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
