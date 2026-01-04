"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { clientApi } from "@/lib/client/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAssistDialog } from "@/components/icps/ai-assist-dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IcpBasicInfo } from "@/components/icps/icp-basic-info";
import { IcpDetailedInfo } from "@/components/icps/icp-detailed-info";
import { IcpSignals } from "@/components/icps/icp-signals";
import type { IcpFormState } from "@/types/components/icps";

const INITIAL_STATE: IcpFormState = {
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
  const [formState, setFormState] = useState<IcpFormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const handleAiValues = (values: Partial<IcpFormState>) => {
    setFormState((prev) => ({ ...prev, ...values }));
    setError(null);
    setSuccess(null);
  };

  const updateField =
    (field: keyof IcpFormState) =>
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
            <IcpBasicInfo
              values={formState}
              onChange={updateField}
              error={error}
            />
            <IcpDetailedInfo
              values={formState}
              onChange={updateField}
              error={error}
            />
            <IcpSignals
              values={formState}
              onChange={updateField}
              error={error}
            />

            <Field>
              <FieldLabel htmlFor="icp-platform">Platform</FieldLabel>
              <Select
                value={formState.platform}
                onValueChange={(val) =>
                  setFormState((prev) => ({ ...prev, platform: val }))
                }
              >
                <SelectTrigger id="icp-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REDDIT">Reddit</SelectItem>
                </SelectContent>
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
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
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
