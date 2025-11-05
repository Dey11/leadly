"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import type { Icp } from "@/types/backend";
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
import { Textarea } from "@/components/ui/textarea";

type EditIcpDialogProps = {
  icp: Icp;
};

export function EditIcpDialog({ icp }: EditIcpDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState(() => ({
    name: icp.name,
    summary: icp.summary,
    targetPersona: icp.targetPersona,
    pains: icp.pains,
    valueProposition: icp.valueProposition,
    qualifyingSignals: icp.qualifyingSignals,
    disqualifyingSignals: icp.disqualifyingSignals,
    platform: icp.platform,
    status: icp.status,
  }));

  useEffect(() => {
    if (open) {
      setFormState({
        name: icp.name,
        summary: icp.summary,
        targetPersona: icp.targetPersona,
        pains: icp.pains,
        valueProposition: icp.valueProposition,
        qualifyingSignals: icp.qualifyingSignals,
        disqualifyingSignals: icp.disqualifyingSignals,
        platform: icp.platform,
        status: icp.status,
      });
      setError(null);
    }
  }, [icp, open]);

  const updateField =
    <
      T extends
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement = HTMLInputElement,
    >(
      field: keyof typeof formState,
    ) =>
    (event: React.ChangeEvent<T>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const mutation = useMutation({
    mutationFn: async () => {
      const {
        name,
        summary,
        targetPersona,
        pains,
        valueProposition,
        qualifyingSignals,
        disqualifyingSignals,
        platform,
        status,
      } = formState;

      if (
        !name ||
        !summary ||
        !targetPersona ||
        !pains ||
        !valueProposition ||
        !qualifyingSignals ||
        !disqualifyingSignals
      ) {
        throw new Error("All ICP fields are required.");
      }

      return clientApi.updateIcp(icp.id, {
        name,
        summary,
        targetPersona,
        pains,
        valueProposition,
        qualifyingSignals,
        disqualifyingSignals,
        platform,
        status,
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
          : "Unable to update the ICP.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit ICP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>Edit ICP briefing</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="space-y-6 px-6 pb-6"
        >
          <FieldGroup className="grid gap-4">
            <Field data-invalid={!!error && !formState.name}>
              <FieldLabel htmlFor={`icp-name-${icp.id}`}>ICP name</FieldLabel>
              <Input
                id={`icp-name-${icp.id}`}
                value={formState.name}
                onChange={updateField("name")}
                required
              />
              {!formState.name && error ? (
                <FieldError>Enter a name.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.summary}>
              <FieldLabel htmlFor={`icp-summary-${icp.id}`}>
                Summary of the offer
              </FieldLabel>
              <Textarea
                id={`icp-summary-${icp.id}`}
                value={formState.summary}
                onChange={updateField<HTMLTextAreaElement>("summary")}
                rows={3}
                required
              />
              {!formState.summary && error ? (
                <FieldError>Summarise your offer.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.targetPersona}>
              <FieldLabel htmlFor={`icp-persona-${icp.id}`}>
                Target persona
              </FieldLabel>
              <Textarea
                id={`icp-persona-${icp.id}`}
                value={formState.targetPersona}
                onChange={updateField<HTMLTextAreaElement>("targetPersona")}
                rows={3}
                required
              />
              {!formState.targetPersona && error ? (
                <FieldError>Describe who the buyer is.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.pains}>
              <FieldLabel htmlFor={`icp-pains-${icp.id}`}>
                Key pain points
              </FieldLabel>
              <Textarea
                id={`icp-pains-${icp.id}`}
                value={formState.pains}
                onChange={updateField<HTMLTextAreaElement>("pains")}
                rows={3}
                required
              />
              {!formState.pains && error ? (
                <FieldError>Capture the pains that matter.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.valueProposition}>
              <FieldLabel htmlFor={`icp-value-${icp.id}`}>
                Value proposition
              </FieldLabel>
              <Textarea
                id={`icp-value-${icp.id}`}
                value={formState.valueProposition}
                onChange={updateField<HTMLTextAreaElement>("valueProposition")}
                rows={3}
                required
              />
              {!formState.valueProposition && error ? (
                <FieldError>Describe the outcome you promise.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.qualifyingSignals}>
              <FieldLabel htmlFor={`icp-qualifying-${icp.id}`}>
                Qualifying signals
              </FieldLabel>
              <Textarea
                id={`icp-qualifying-${icp.id}`}
                value={formState.qualifyingSignals}
                onChange={updateField<HTMLTextAreaElement>("qualifyingSignals")}
                rows={3}
                required
              />
              {!formState.qualifyingSignals && error ? (
                <FieldError>List qualifying signals.</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={!!error && !formState.disqualifyingSignals}>
              <FieldLabel htmlFor={`icp-disqualifying-${icp.id}`}>
                Disqualifying signals
              </FieldLabel>
              <Textarea
                id={`icp-disqualifying-${icp.id}`}
                value={formState.disqualifyingSignals}
                onChange={updateField<HTMLTextAreaElement>(
                  "disqualifyingSignals",
                )}
                rows={3}
                required
              />
              {!formState.disqualifyingSignals && error ? (
                <FieldError>List disqualifiers.</FieldError>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor={`icp-platform-${icp.id}`}>
                Platform
              </FieldLabel>
              <Select
                id={`icp-platform-${icp.id}`}
                value={formState.platform}
                onChange={updateField("platform")}
              >
                <option value="REDDIT">Reddit</option>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor={`icp-status-${icp.id}`}>Status</FieldLabel>
              <Select
                id={`icp-status-${icp.id}`}
                value={formState.status}
                onChange={updateField("status")}
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
          </FieldGroup>
          {error ? (
            <p className="text-destructive text-sm font-medium">{error}</p>
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

