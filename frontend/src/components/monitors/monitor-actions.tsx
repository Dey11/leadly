"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => clientApi.deleteMonitor(monitorId),
    onSuccess: () => {
      router.refresh();
      setOpen(false);
    },
    onError: () => {
      setOpen(false);
    },
  });

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Deleting..." : "Delete"}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          if (!mutation.isPending) {
            setOpen(next);
          }
        }}
        title="Delete this monitor?"
        description="Lead history from this monitor will be removed. This action cannot be undone."
        confirmLabel="Delete monitor"
        tone="destructive"
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </>
  );
}
