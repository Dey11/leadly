"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { IcpFieldProps } from "@/types/components/icps";

export function IcpDetailedInfo({ values, onChange, error }: IcpFieldProps) {
  return (
    <>
      <Field data-invalid={!!error && !values.targetPersona}>
        <FieldLabel htmlFor="icp-persona">Target persona</FieldLabel>
        <Textarea
          id="icp-persona"
          name="targetPersona"
          placeholder="Roles, company attributes, budget ranges, or market focus that define your ideal buyer."
          value={values.targetPersona}
          onChange={onChange("targetPersona")}
          aria-invalid={!!error && !values.targetPersona}
          rows={3}
          required
        />
        {!values.targetPersona && error && (
          <FieldError>Describe who the buyer is.</FieldError>
        )}
      </Field>

      <Field data-invalid={!!error && !values.pains}>
        <FieldLabel htmlFor="icp-pains">Key pain points</FieldLabel>
        <Textarea
          id="icp-pains"
          name="pains"
          placeholder="List the specific pains or triggers that make this persona look for help."
          value={values.pains}
          onChange={onChange("pains")}
          aria-invalid={!!error && !values.pains}
          rows={3}
          required
        />
        {!values.pains && error && (
          <FieldError>Capture the pains that matter.</FieldError>
        )}
      </Field>

      <Field data-invalid={!!error && !values.valueProposition}>
        <FieldLabel htmlFor="icp-value">Value proposition</FieldLabel>
        <Textarea
          id="icp-value"
          name="valueProposition"
          placeholder="Explain how you solve those pains or what outcome you deliver."
          value={values.valueProposition}
          onChange={onChange("valueProposition")}
          aria-invalid={!!error && !values.valueProposition}
          rows={3}
          required
        />
        {!values.valueProposition && error && (
          <FieldError>Describe the outcome you promise.</FieldError>
        )}
      </Field>
    </>
  );
}
