"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bug, AlertTriangle, Loader2 } from "lucide-react";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BugReportCategory, BugReportSeverity } from "@/types/bug-report";

const CATEGORY_OPTIONS: { value: BugReportCategory; label: string }[] = [
  { value: "BUG", label: "🐛 Bug" },
  { value: "FEATURE_REQUEST", label: "✨ Feature Request" },
  { value: "QUESTION", label: "❓ Question" },
  { value: "OTHER", label: "📝 Other" },
];

const SEVERITY_OPTIONS: { value: BugReportSeverity; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

type FormData = {
  title: string;
  description: string;
  category: BugReportCategory;
  severity: BugReportSeverity | "";
};

export function BugReportDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    category: "BUG",
    severity: "",
  });
  const [success, setSuccess] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      clientApi.createBugReport({
        title: form.title,
        description: form.description,
        category: form.category,
        severity: form.severity || undefined,
        pageUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
      }),
    onSuccess: () => {
      setSuccess(true);
      setForm({ title: "", description: "", category: "BUG", severity: "" });
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const isValid =
    form.title.length >= 5 && form.description.length >= 20 && form.category;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="border-sidebar-border bg-sidebar/70 hover:bg-primary/5 group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-1 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur transition-colors"
        >
          <div className="bg-primary/10 group-hover:bg-primary/20 flex size-8 items-center justify-center rounded-xl transition-colors">
            <Bug className="text-primary size-4" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sidebar-foreground text-sm">
              Report a Bug
            </span>
            <span className="text-muted-foreground text-[10px]">
              Help us improve Leadly
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="text-primary size-5" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Found an issue or have a suggestion? Let us know and we&apos;ll look
            into it.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <AlertDescription className="flex items-center gap-2">
              ✓ Thank you! Your report has been submitted successfully.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bug-title">Title</Label>
              <Input
                id="bug-title"
                placeholder="Brief summary of the issue"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                maxLength={100}
              />
              {form.title.length > 0 && form.title.length < 5 && (
                <p className="text-destructive text-xs">
                  Title must be at least 5 characters
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bug-category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value: BugReportCategory) =>
                    setForm((f) => ({ ...f, category: value }))
                  }
                >
                  <SelectTrigger id="bug-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.category === "BUG" && (
                <div className="space-y-2">
                  <Label htmlFor="bug-severity">Severity</Label>
                  <Select
                    value={form.severity}
                    onValueChange={(value: BugReportSeverity) =>
                      setForm((f) => ({ ...f, severity: value }))
                    }
                  >
                    <SelectTrigger id="bug-severity">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-description">Description</Label>
              <Textarea
                id="bug-description"
                placeholder="Please describe the issue in detail. What did you expect to happen? What happened instead?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
                maxLength={2000}
              />
              <div className="flex justify-between text-xs">
                {form.description.length > 0 && form.description.length < 20 ? (
                  <p className="text-destructive">
                    Description must be at least 20 characters
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-muted-foreground">
                  {form.description.length}/2000
                </span>
              </div>
            </div>

            {createMutation.isError && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Failed to submit report. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
