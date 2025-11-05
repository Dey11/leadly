"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import type { Monitor } from "@/types/backend";
import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type EditMonitorDialogProps = {
  monitor: Monitor & { icpName?: string };
  icps: Array<{ id: string; name: string; platform: string }>;
};

export function EditMonitorDialog({ monitor, icps }: EditMonitorDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState(() => ({
    icpId: monitor.icpId,
    target: monitor.target,
    status: monitor.status,
  }));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFormState({
        icpId: monitor.icpId,
        target: monitor.target,
        status: monitor.status,
      });
      setError(null);
    }
  }, [monitor, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!formState.target || !formState.icpId) {
        throw new Error("ICP and monitor target are required.");
      }

      return clientApi.updateMonitor(monitor.id, {
        icpId: formState.icpId,
        target: formState.target,
        status: formState.status,
      });
    },
    onSuccess: () => {
      router.refresh();
      setOpen(false);
    },
    onError: (mutationError: unknown) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to update the monitor.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Edit monitor</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="px-6 pb-6"
        >
          <FieldGroup className="space-y-4">
            <Field data-invalid={!!error && !formState.icpId}>
              <FieldLabel htmlFor={`monitor-icp-${monitor.id}`}>
                ICP
              </FieldLabel>
              <Select
                id={`monitor-icp-${monitor.id}`}
                value={formState.icpId}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    icpId: event.target.value,
                  }))
                }
                required
              >
                {icps.map((icp) => (
                  <option key={icp.id} value={icp.id}>
                    {icp.name} · {icp.platform}
                  </option>
                ))}
              </Select>
              {!formState.icpId && error ? (
                <FieldError>Select an ICP.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.target}>
              <FieldLabel htmlFor={`monitor-target-${monitor.id}`}>
                Target
              </FieldLabel>
              <Input
                id={`monitor-target-${monitor.id}`}
                value={formState.target}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    target: event.target.value,
                  }))
                }
                required
              />
              {!formState.target && error ? (
                <FieldError>Enter a target.</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor={`monitor-status-${monitor.id}`}>
                Status
              </FieldLabel>
              <Select
                id={`monitor-status-${monitor.id}`}
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    status: event.target.value as Monitor["status"],
                  }))
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
          </FieldGroup>
          {error ? (
            <p className="text-destructive mt-4 text-sm font-medium">
              {error}
            </p>
          ) : null}
          <DialogFooter className="border-t border-border/40 px-0 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
