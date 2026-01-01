"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { IcpCreationStepper } from "@/components/dashboard/icp/icp-stepper";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, PenTool, ArrowRight, Check } from "lucide-react";
import { clientApi } from "@/lib/client/api";

type AiGeneratedFields = {
  name: string;
  summary: string;
  targetPersona: string;
  pains: string;
  valueProposition: string;
  qualifyingSignals: string;
  disqualifyingSignals: string;
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

export default function CreateIcpPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"ai" | "manual" | null>(null);

  // AI mode states
  const [description, setDescription] = useState("");
  const [generatedFields, setGeneratedFields] =
    useState<AiGeneratedFields | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // AI generation mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const validationError = validateDescription(description);
      if (validationError) {
        throw new Error(validationError);
      }
      return clientApi.suggestIcp({ description: description.trim() });
    },
    onSuccess: (data) => {
      setGeneratedFields(data);
      setAiError(null);
    },
    onError: (err) => {
      setAiError(
        err instanceof Error
          ? err.message
          : "Failed to generate ICP. Please try again.",
      );
    },
  });

  // Create ICP mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!generatedFields) throw new Error("No fields to submit");
      return clientApi.createIcp({
        ...generatedFields,
        platform: "REDDIT",
      });
    },
    onSuccess: () => {
      router.push("/dashboard/icps");
      router.refresh();
    },
    onError: (err) => {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create ICP",
      );
    },
  });

  const handleGenerate = () => {
    setAiError(null);
    generateMutation.mutate();
  };

  const handleCreateIcp = () => {
    setCreateError(null);
    createMutation.mutate();
  };

  const updateField = (field: keyof AiGeneratedFields, value: string) => {
    if (!generatedFields) return;
    setGeneratedFields({ ...generatedFields, [field]: value });
  };

  const charCount = description.trim().length;
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
  const meetsMinimum =
    charCount >= MIN_DESCRIPTION_LENGTH && wordCount >= MIN_WORD_COUNT;

  const handleRestart = () => {
    setGeneratedFields(null);
    setDescription("");
    setAiError(null);
    setCreateError(null);
  };

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <DashboardPageHeader
        title="Create Ideal Customer Profile"
        description="Teach Leadly who your perfect customer is so we can find them."
      />

      {!mode ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card
            className="hover:border-primary/50 group cursor-pointer transition-all hover:shadow-md"
            onClick={() => setMode("ai")}
          >
            <CardHeader>
              <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle>Generate with AI</CardTitle>
              <CardDescription>
                Describe your business in plain English, and we'll build the
                tracking rules for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Select AI Mode
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 group cursor-pointer transition-all hover:shadow-md"
            onClick={() => setMode("manual")}
          >
            <CardHeader>
              <div className="bg-secondary text-foreground mb-2 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110">
                <PenTool className="h-6 w-6" />
              </div>
              <CardTitle>Manual Setup</CardTitle>
              <CardDescription>
                Manually configure keywords, subreddits, and signals for precise
                control.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Select Manual Mode
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : mode === "manual" ? (
        <div className="mt-8 space-y-6">
          <Button
            variant="ghost"
            onClick={() => setMode(null)}
            className="pl-0 transition-all hover:pl-2"
          >
            ← Back to selection
          </Button>
          <IcpCreationStepper />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <Button
            variant="ghost"
            onClick={() => setMode(null)}
            className="pl-0 transition-all hover:pl-2"
          >
            ← Back to selection
          </Button>

          {!generatedFields ? (
            // Step 1: Describe your ideal customer
            <Card className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-lg backdrop-blur">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Describe Your Ideal Customer</CardTitle>
                    <CardDescription>
                      Tell us about your business and who you want to reach
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="ai-description"
                    className="text-sm font-medium"
                  >
                    What does your ideal customer look like?
                  </Label>
                  <Textarea
                    id="ai-description"
                    placeholder="Example: We sell inventory management software to small e-commerce businesses. Our ideal customers are store owners with 5-50 employees who sell physical products and struggle with manual stock tracking..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (aiError) setAiError(null);
                    }}
                    rows={6}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    className="mt-2 resize-none text-sm leading-relaxed"
                    disabled={generateMutation.isPending}
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

                {aiError && (
                  <Alert variant="destructive">
                    <AlertDescription>{aiError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !meetsMinimum}
                  >
                    {generateMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate ICP Fields
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Step 2: Review and submit generated fields
            <Card className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-lg backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Review Generated ICP</CardTitle>
                      <CardDescription>
                        Review and edit the fields, then create your ICP
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gen-name" className="text-sm font-medium">
                      ICP Name
                    </Label>
                    <Input
                      id="gen-name"
                      value={generatedFields.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gen-summary"
                      className="text-sm font-medium"
                    >
                      Summary
                    </Label>
                    <Textarea
                      id="gen-summary"
                      value={generatedFields.summary}
                      onChange={(e) => updateField("summary", e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gen-persona"
                      className="text-sm font-medium"
                    >
                      Target Persona
                    </Label>
                    <Textarea
                      id="gen-persona"
                      value={generatedFields.targetPersona}
                      onChange={(e) =>
                        updateField("targetPersona", e.target.value)
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gen-pains" className="text-sm font-medium">
                      Pain Points
                    </Label>
                    <Textarea
                      id="gen-pains"
                      value={generatedFields.pains}
                      onChange={(e) => updateField("pains", e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gen-value" className="text-sm font-medium">
                      Value Proposition
                    </Label>
                    <Textarea
                      id="gen-value"
                      value={generatedFields.valueProposition}
                      onChange={(e) =>
                        updateField("valueProposition", e.target.value)
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gen-qualifying"
                      className="text-sm font-medium"
                    >
                      Qualifying Signals
                    </Label>
                    <Textarea
                      id="gen-qualifying"
                      value={generatedFields.qualifyingSignals}
                      onChange={(e) =>
                        updateField("qualifyingSignals", e.target.value)
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gen-disqualifying"
                      className="text-sm font-medium"
                    >
                      Disqualifying Signals
                    </Label>
                    <Textarea
                      id="gen-disqualifying"
                      value={generatedFields.disqualifyingSignals}
                      onChange={(e) =>
                        updateField("disqualifyingSignals", e.target.value)
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>

                {createError && (
                  <Alert variant="destructive">
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleRestart}>
                    Start Over
                  </Button>
                  <Button
                    onClick={handleCreateIcp}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create ICP
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
