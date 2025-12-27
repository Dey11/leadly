"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAssistDialog } from "@/components/icps/ai-assist-dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_STATE = {
  name: "",
  summary: "",
  targetPersona: "",
  pains: "",
  valueProposition: "",
  qualifyingSignals: "",
  disqualifyingSignals: "",
  platform: "REDDIT",
};

export function CreateIcpForm() {
  const router = useRouter();
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handleAiValues = (values: {
    name: string;
    summary: string;
    targetPersona: string;
    pains: string;
    valueProposition: string;
    qualifyingSignals: string;
    disqualifyingSignals: string;
  }) => {
    setFormState((prev) => ({ ...prev, ...values }));
    setError(null);
    setSuccess(null);
  };

  const updateField =
    (field: keyof typeof INITIAL_STATE) =>
      (
        event: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
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
        throw new Error("Please complete every section of the ICP briefing.");
      }

      return clientApi.createIcp({
        name,
        summary,
        targetPersona,
        pains,
        valueProposition,
        qualifyingSignals,
        disqualifyingSignals,
        platform,
      });
    },
    onSuccess: () => {
      setError(null);
      setSuccess(
        "ICP created. Add monitors to start collecting leads against this profile.",
      );
      setFormState(INITIAL_STATE);
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setSuccess(null);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create the ICP.",
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <Card className="bg-background/80">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Define a new ICP</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAiDialogOpen(true)}
        >
          Use AI Help
        </Button>
      </CardHeader>
      <AiAssistDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onUseValues={handleAiValues}
      />
      <CardContent className="">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FieldGroup>
            <Field data-invalid={!!error && !formState.name}>
              <FieldLabel htmlFor="icp-name">ICP name</FieldLabel>
              <Input
                id="icp-name"
                name="name"
                placeholder="Cold outreach for AI automation agencies"
                value={formState.name}
                onChange={updateField("name")}
                aria-invalid={!!error && !formState.name}
                required
              />
              {!formState.name && error && (
                <FieldError>Enter a name.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !formState.summary}>
              <FieldLabel htmlFor="icp-summary">
                Summary of the offer
              </FieldLabel>
              <Textarea
                id="icp-summary"
                name="summary"
                placeholder="Briefly explain what you sell and why someone buys it."
                value={formState.summary}
                onChange={updateField("summary")}
                aria-invalid={!!error && !formState.summary}
                rows={3}
                required
              />
              {!formState.summary && error && (
                <FieldError>Summarise your offer.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !formState.targetPersona}>
              <FieldLabel htmlFor="icp-persona">Target persona</FieldLabel>
              <Textarea
                id="icp-persona"
                name="targetPersona"
                placeholder="Roles, company attributes, budget ranges, or market focus that define your ideal buyer."
                value={formState.targetPersona}
                onChange={updateField("targetPersona")}
                aria-invalid={!!error && !formState.targetPersona}
                rows={3}
                required
              />
              {!formState.targetPersona && error && (
                <FieldError>Describe who the buyer is.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !formState.pains}>
              <FieldLabel htmlFor="icp-pains">Key pain points</FieldLabel>
              <Textarea
                id="icp-pains"
                name="pains"
                placeholder="List the specific pains or triggers that make this persona look for help."
                value={formState.pains}
                onChange={updateField("pains")}
                aria-invalid={!!error && !formState.pains}
                rows={3}
                required
              />
              {!formState.pains && error && (
                <FieldError>Capture the pains that matter.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !formState.valueProposition}>
              <FieldLabel htmlFor="icp-value">Value proposition</FieldLabel>
              <Textarea
                id="icp-value"
                name="valueProposition"
                placeholder="Explain how you solve those pains or what outcome you deliver."
                value={formState.valueProposition}
                onChange={updateField("valueProposition")}
                aria-invalid={!!error && !formState.valueProposition}
                rows={3}
                required
              />
              {!formState.valueProposition && error && (
                <FieldError>Describe the outcome you promise.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !formState.qualifyingSignals}>
              <FieldLabel htmlFor="icp-qualifiers">
                Qualifying signals
              </FieldLabel>
              <Textarea
                id="icp-qualifiers"
                name="qualifyingSignals"
                placeholder="Signals or keywords that indicate someone is a great fit (e.g. “hiring a RevOps specialist”, “manual onboarding backlog”)."
                value={formState.qualifyingSignals}
                onChange={updateField("qualifyingSignals")}
                aria-invalid={!!error && !formState.qualifyingSignals}
                rows={4}
                required
              />
              {!formState.qualifyingSignals && error && (
                <FieldError>List the signals that matter.</FieldError>
              )}
            </Field>

            <Field data-invalid={!!error && !formState.disqualifyingSignals}>
              <FieldLabel htmlFor="icp-disqualifiers">
                Disqualifying signals
              </FieldLabel>
              <Textarea
                id="icp-disqualifiers"
                name="disqualifyingSignals"
                placeholder="Things that should be ignored (e.g. students, DIY hobbyists, budgets under $1k)."
                value={formState.disqualifyingSignals}
                onChange={updateField("disqualifyingSignals")}
                aria-invalid={!!error && !formState.disqualifyingSignals}
                rows={3}
                required
              />
              {!formState.disqualifyingSignals && error && (
                <FieldError>Clarify who is not a fit.</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="icp-platform">Platform</FieldLabel>
              <Select
                id="icp-platform"
                name="platform"
                value={formState.platform}
                onChange={updateField("platform")}
              >
                <option value="REDDIT">Reddit</option>
              </Select>
            </Field>
          </FieldGroup>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Unable to create the ICP</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <AlertTitle>ICP created</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating ICP..." : "Create ICP"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
