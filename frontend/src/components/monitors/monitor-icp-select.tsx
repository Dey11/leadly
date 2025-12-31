"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IcpOption } from "@/types/components/monitors";

interface MonitorIcpSelectProps {
  icps: IcpOption[];
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export function MonitorIcpSelect({
  icps,
  value,
  onChange,
  error,
}: MonitorIcpSelectProps) {
  return (
    <Field data-invalid={!!error && !value}>
      <FieldLabel htmlFor="monitor-icp">ICP</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="monitor-icp">
          <SelectValue placeholder="Select ICP" />
        </SelectTrigger>
        <SelectContent>
          {icps.map((icp) => (
            <SelectItem key={icp.id} value={icp.id}>
              {icp.name} · {icp.platform}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!value && error && <FieldError>Select an ICP to continue.</FieldError>}
    </Field>
  );
}
