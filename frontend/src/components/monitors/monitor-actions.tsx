"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";

type MonitorStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export function ToggleMonitorStatusButton({
  monitorId,
  status,
}: {
  monitorId: string;
  status: MonitorStatus;
}) {
  const router = useRouter();
  const nextStatus: MonitorStatus = status === "ACTIVE" ? "PAUSED" : "ACTIVE";

  const mutation = useMutation({
    mutationFn: () => clientApi.updateMonitorStatus(monitorId, nextStatus),
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending
        ? nextStatus === "ACTIVE"
          ? "Activating..."
          : "Pausing..."
        : nextStatus === "ACTIVE"
          ? "Resume"
          : "Pause"}
    </Button>
  );
}

export function DeleteMonitorButton({ monitorId }: { monitorId: string }) {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => clientApi.deleteMonitor(monitorId),
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Delete this monitor? Scrape history will be removed."
    );
    if (!confirmed) return;

    mutation.mutate();
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

