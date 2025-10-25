"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHour } from "@/lib/format";

type ScheduleFormProps = {
  scheduledHours: number[];
  maxSelectable: number;
};

export function ScheduleForm({
  scheduledHours,
  maxSelectable,
}: ScheduleFormProps) {
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(scheduledHours)
  );
  const [limitReached, setLimitReached] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (selected.size === 0) {
        throw new Error("Select at least one hour.");
      }
      return clientApi.updateSchedule({
        scheduledHours: Array.from(selected.values()).sort((a, b) => a - b),
      });
    },
    onSuccess: () => {
      setSuccessMessage("Schedule updated. Your next scrape will follow this cadence.");
      setErrorMessage(null);
    },
    onError: (error: unknown) => {
      setSuccessMessage(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save schedule."
      );
    },
  });

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, index) => index),
    []
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
        <p className="text-sm text-muted-foreground">
          Select up to {maxSelectable} unique hours in your local timezone. Leadly
          will scrape your monitors shortly after these windows.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-3 gap-3 text-sm sm:grid-cols-4">
            {hours.map((hour) => {
              const isChecked = selected.has(hour);
              return (
                <label
                  key={hour}
                  className={`flex cursor-pointer select-none items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-3 py-2 transition-colors ${
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
                      toggleHour(hour, event.currentTarget.checked)
                    }
                  />
                  <span className="text-sm font-medium">
                    {formatHour(hour)}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {selected.size}/{maxSelectable} hours selected
            </span>
            {limitReached && (
              <span className="text-destructive">
                Limit reached. Deselect an hour before adding another.
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
            <Alert variant="success">
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

