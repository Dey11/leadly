"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatUtcHourListAsLocal } from "@/lib/format";

interface CurrentScheduleCardProps {
  scheduledHours: number[];
}

export function CurrentScheduleCard({
  scheduledHours,
}: CurrentScheduleCardProps) {
  return (
    <Card className="border-border/60 bg-background/85">
      <CardHeader>
        <CardTitle>Current schedule</CardTitle>
        <CardDescription>
          These windows are used until you make changes above.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 text-sm">
        {scheduledHours.length > 0 ? (
          <>
            <Badge variant="outline">
              {scheduledHours.length}{" "}
              {scheduledHours.length === 1 ? "window" : "windows"}
            </Badge>
            <p className="leading-relaxed">
              {formatUtcHourListAsLocal(scheduledHours)}
            </p>
          </>
        ) : (
          <p>No schedule yet. Select at least one hour to begin scraping.</p>
        )}
      </CardContent>
    </Card>
  );
}
