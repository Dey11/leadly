"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { IcpFieldProps } from "@/types/components/icps";

export function IcpSignals({ values, onChange, error }: IcpFieldProps) {
  return (
    <>
      <Field data-invalid={!!error && !values.qualifyingSignals}>
        <FieldLabel htmlFor="icp-qualifiers">Qualifying signals</FieldLabel>
        <Textarea
          id="icp-qualifiers"
          name="qualifyingSignals"
          placeholder="Signals or keywords that indicate someone is a great fit (e.g. “hiring a RevOps specialist”, “manual onboarding backlog”)."
          value={values.qualifyingSignals}
          onChange={onChange("qualifyingSignals")}
          aria-invalid={!!error && !values.qualifyingSignals}
          rows={4}
          required
        />
        {!values.qualifyingSignals && error && (
          <FieldError>List the signals that matter.</FieldError>
        )}
      </Field>

      <Field data-invalid={!!error && !values.disqualifyingSignals}>
        <FieldLabel htmlFor="icp-disqualifiers">
          Disqualifying signals
        </FieldLabel>
        <Textarea
          id="icp-disqualifiers"
          name="disqualifyingSignals"
          placeholder="Things that should be ignored (e.g. students, DIY hobbyists, budgets under $1k)."
          value={values.disqualifyingSignals}
          onChange={onChange("disqualifyingSignals")}
          aria-invalid={!!error && !values.disqualifyingSignals}
          rows={3}
          required
        />
        {!values.disqualifyingSignals && error && (
          <FieldError>Clarify who is not a fit.</FieldError>
        )}
      </Field>
    </>
  );
}
