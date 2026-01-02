"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MonitorIcpDialogProps = {
  monitorName: string;
  icp: {
    id: string;
    name: string;
    platform: string;
    summary: string;
    targetPersona: string;
    pains: string;
    valueProposition: string;
    qualifyingSignals: string;
    disqualifyingSignals: string;
  };
};

export function MonitorIcpDialog({ monitorName, icp }: MonitorIcpDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="ml-auto">
          View ICP
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 py-5">
          <DialogTitle>{icp.name}</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Monitor{" "}
            <span className="text-foreground font-medium">{monitorName}</span>{" "}
            references this ICP. Platform · {icp.platform}
          </p>
        </DialogHeader>
        <div className="text-muted-foreground space-y-6 px-6 pb-6 text-sm">
          <Section label="Summary">{icp.summary}</Section>
          <Section label="Target persona">{icp.targetPersona}</Section>
          <Section label="Pain points">{icp.pains}</Section>
          <Section label="Value proposition">{icp.valueProposition}</Section>
          <Section label="Qualifying signals">{icp.qualifyingSignals}</Section>
          <Section label="Disqualifying signals">
            {icp.disqualifyingSignals}
          </Section>
        </div>
        <DialogFooter className="border-border/40 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground leading-relaxed">{children}</p>
    </div>
  );
}
