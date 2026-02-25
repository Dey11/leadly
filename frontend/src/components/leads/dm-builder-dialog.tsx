"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Copy, ExternalLink, Loader2, X, Send, Check } from "lucide-react";
import { toast } from "sonner";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DmBuilderDialogProps = {
  leadId: string | null;
  author: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DmBuilderDialog({
  leadId,
  author,
  open,
  onOpenChange,
}: DmBuilderDialogProps) {
  const [generatedDm, setGeneratedDm] = useState<string | null>(null);
  const triggeredRef = useRef<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: (id: string) => clientApi.generateDm(id),
    onSuccess: (data) => {
      setGeneratedDm(data.dm);
    },
    onError: (error) => {
      toast.error("Failed to generate DM", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  // Trigger mutation when dialog opens with a new leadId
  useEffect(() => {
    console.log("[DmBuilderDialog] useEffect", {
      open,
      leadId,
      triggered: triggeredRef.current,
    });
    if (open && leadId && triggeredRef.current !== leadId) {
      console.log("[DmBuilderDialog] Triggering mutation for", leadId);
      triggeredRef.current = leadId;
      generateMutation.mutate(leadId);
    }
    if (!open) {
      triggeredRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, leadId]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setGeneratedDm(null);
      generateMutation.reset();
    }
    onOpenChange(newOpen);
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!generatedDm) return;
    try {
      await navigator.clipboard.writeText(generatedDm);
      setIsCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const dmLink =
    author && generatedDm
      ? `https://reddit.com/message/compose/?to=${encodeURIComponent(
          author,
        )}&subject=${encodeURIComponent(
          "Regarding your post",
        )}&message=${encodeURIComponent(generatedDm)}`
      : author
        ? `https://reddit.com/message/compose/?to=${encodeURIComponent(author)}`
        : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="border-0 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Send className="text-primary h-5 w-5" />
              <DialogTitle className="text-xl font-semibold">
                Cold DM Builder
              </DialogTitle>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <X className="size-4" aria-hidden />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription className="text-xs">
            AI-generated personalized message based on this lead&apos;s post
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
          {generateMutation.isPending ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Generating personalized DM...
              </p>
            </div>
          ) : generateMutation.isError ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3">
              <p className="text-destructive text-sm">Failed to generate DM</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => leadId && generateMutation.mutate(leadId)}
              >
                Try again
              </Button>
            </div>
          ) : generatedDm ? (
            <div className="space-y-3">
              <div className="border-border/60 bg-card/80 text-foreground relative rounded-lg border p-4 text-sm leading-relaxed">
                {generatedDm}
              </div>
              {author && (
                <p className="text-muted-foreground text-xs">
                  Recipient: <span className="text-foreground">u/{author}</span>
                </p>
              )}
            </div>
          ) : null}
        </div>

        {generatedDm && (
          <DialogFooter className="bg-card/90 flex-col gap-2 p-4 sm:flex-row sm:p-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 transition-all duration-200 sm:flex-none"
              onClick={handleCopy}
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy message
                </>
              )}
            </Button>
            {dmLink ? (
              <Button asChild size="sm" className="flex-1 sm:flex-none">
                <a href={dmLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  DM Source
                </a>
              </Button>
            ) : (
              <Button size="sm" disabled className="flex-1 sm:flex-none">
                <ExternalLink className="mr-2 h-4 w-4" />
                No author found
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
