"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { IcpFieldProps } from "@/types/components/icps";

export function IcpBasicInfo({ values, onChange, error }: IcpFieldProps) {
  return (
    <>
      <Field data-invalid={!!error && !values.name}>
        <FieldLabel htmlFor="icp-name">ICP name</FieldLabel>
        <Input
          id="icp-name"
          name="name"
          placeholder="Cold outreach for AI automation agencies"
          value={values.name}
          onChange={onChange("name")}
          aria-invalid={!!error && !values.name}
          required
        />
        {!values.name && error && <FieldError>Enter a name.</FieldError>}
      </Field>

      <Field data-invalid={!!error && !values.summary}>
        <FieldLabel htmlFor="icp-summary">Summary of the offer</FieldLabel>
        <Textarea
          id="icp-summary"
          name="summary"
          placeholder="Briefly explain what you sell and why someone buys it."
          value={values.summary}
          onChange={onChange("summary")}
          aria-invalid={!!error && !values.summary}
          rows={3}
          required
        />
        {!values.summary && error && (
          <FieldError>Summarise your offer.</FieldError>
        )}
      </Field>
    </>
  );
}
