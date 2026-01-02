"use client";

import { useState, ChangeEvent, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clientApi } from "@/lib/client/api";

type IcpFields = {
  name: string;
  summary: string;
  targetPersona: string;
  pains: string;
  valueProposition: string;
  qualifyingSignals: string;
  disqualifyingSignals: string;
};

type AiAssistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseValues: (values: IcpFields) => void;
};

const MIN_DESCRIPTION_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_WORD_COUNT = 5;

function validateDescription(description: string): string | null {
  const trimmed = description.trim();

  if (!trimmed) {
    return "Please describe your ideal customer.";
  }

  if (trimmed.length < MIN_DESCRIPTION_LENGTH) {
    return `Please provide more detail (at least ${MIN_DESCRIPTION_LENGTH} characters). Currently: ${trimmed.length}`;
  }

  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return `Description is too long. Maximum ${MAX_DESCRIPTION_LENGTH} characters. Currently: ${trimmed.length}`;
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORD_COUNT) {
    return `Please use at least ${MIN_WORD_COUNT} words. Currently: ${wordCount}`;
  }

  return null;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

export function AiAssistDialog({
  open,
  onOpenChange,
  onUseValues,
}: AiAssistDialogProps) {
  const [description, setDescription] = useState("");
  const [generatedFields, setGeneratedFields] = useState<IcpFields | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDescription("");
      setGeneratedFields(null);
      setLoading(false);
      setError(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    const validationError = validateDescription(description);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await clientApi.suggestIcp({
        description: description.trim(),
      });
      setGeneratedFields(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate ICP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateGeneratedField =
    (field: keyof IcpFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!generatedFields) return;
      setGeneratedFields((prev) =>
        prev ? { ...prev, [field]: event.target.value } : null,
      );
    };

  const handleUseValues = () => {
    if (!generatedFields) return;
    onUseValues(generatedFields);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const charCount = description.trim().length;
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const meetsMinimum =
    charCount >= MIN_DESCRIPTION_LENGTH && wordCount >= MIN_WORD_COUNT;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[85vh] max-w-xl flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <SparkleIcon className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                AI-Assisted ICP Creation
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-0.5 text-sm">
                Describe your ideal customer in plain language
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!generatedFields ? (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="ai-description"
                  className="text-foreground mb-2 block text-sm font-medium"
                >
                  What does your ideal customer look like?
                </Label>
                <Textarea
                  id="ai-description"
                  placeholder="Example: We sell inventory management software to small e-commerce businesses. Our ideal customers are store owners with 5-50 employees who sell physical products and struggle with manual stock tracking..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError(null);
                  }}
                  rows={6}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className="resize-none text-sm leading-relaxed"
                  disabled={loading}
                />
                <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                  <span className={meetsMinimum ? "text-green-600" : ""}>
                    {wordCount} words · {charCount}/{MAX_DESCRIPTION_LENGTH}{" "}
                    chars
                  </span>
                  {charCount > MAX_DESCRIPTION_LENGTH * 0.9 ? (
                    <span className="text-amber-600">
                      {MAX_DESCRIPTION_LENGTH - charCount} remaining
                    </span>
                  ) : (
                    <span>
                      Min: {MIN_WORD_COUNT} words, {MIN_DESCRIPTION_LENGTH}{" "}
                      chars
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
                <p className="text-foreground text-sm">
                  ✨ Review and edit the fields below, then apply them to your
                  form.
                </p>
              </div>

              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel
                    htmlFor="gen-name"
                    className="text-sm font-medium"
                  >
                    ICP Name
                  </FieldLabel>
                  <Input
                    id="gen-name"
                    value={generatedFields.name}
                    onChange={updateGeneratedField("name")}
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="gen-summary"
                    className="text-sm font-medium"
                  >
                    Summary
                  </FieldLabel>
                  <Textarea
                    id="gen-summary"
                    value={generatedFields.summary}
                    onChange={updateGeneratedField("summary")}
                    rows={2}
                    className="resize-none"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="gen-persona"
                    className="text-sm font-medium"
                  >
                    Target Persona
                  </FieldLabel>
                  <Textarea
                    id="gen-persona"
                    value={generatedFields.targetPersona}
                    onChange={updateGeneratedField("targetPersona")}
                    rows={2}
                    className="resize-none"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="gen-pains"
                    className="text-sm font-medium"
                  >
                    Pain Points
                  </FieldLabel>
                  <Textarea
                    id="gen-pains"
                    value={generatedFields.pains}
                    onChange={updateGeneratedField("pains")}
                    rows={2}
                    className="resize-none"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="gen-value"
                    className="text-sm font-medium"
                  >
                    Value Proposition
                  </FieldLabel>
                  <Textarea
                    id="gen-value"
                    value={generatedFields.valueProposition}
                    onChange={updateGeneratedField("valueProposition")}
                    rows={2}
                    className="resize-none"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="gen-qualifying"
                    className="text-sm font-medium"
                  >
                    Qualifying Signals
                  </FieldLabel>
                  <Textarea
                    id="gen-qualifying"
                    value={generatedFields.qualifyingSignals}
                    onChange={updateGeneratedField("qualifyingSignals")}
                    rows={2}
                    className="resize-none"
                  />
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="gen-disqualifying"
                    className="text-sm font-medium"
                  >
                    Disqualifying Signals
                  </FieldLabel>
                  <Textarea
                    id="gen-disqualifying"
                    value={generatedFields.disqualifyingSignals}
                    onChange={updateGeneratedField("disqualifyingSignals")}
                    rows={2}
                    className="resize-none"
                  />
                </Field>
              </FieldGroup>

              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              size="sm"
            >
              Cancel
            </Button>
            {!generatedFields ? (
              <Button
                onClick={handleGenerate}
                disabled={loading || !meetsMinimum}
                size="sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <SparkleIcon className="h-4 w-4" />
                    Generate Fields
                  </span>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleUseValues} size="sm">
                Use These Values
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
