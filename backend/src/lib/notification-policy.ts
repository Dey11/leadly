import type { LeadType } from "@prisma/client";

export const NOTIFIABLE_LEAD_TYPES = ["WARM", "NEUTRAL"] as const;

// Enforce the current alert policy for channels saved before cold alerts were removed.
export function notificationLeadTypes(types: readonly LeadType[]): LeadType[] {
  return types.filter((type) => type === "WARM" || type === "NEUTRAL");
}
