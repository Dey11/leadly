"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { clientApi } from "@/lib/client/api";

interface CreateKeywordSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateKeywordSetDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateKeywordSetDialogProps) {
  const [name, setName] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; keywords: string[] }) =>
      clientApi.createKeywordSet(data),
    onSuccess: () => {
      resetForm();
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(
        err instanceof Error ? err.message : "Failed to create keyword set",
      );
    },
  });

  const resetForm = () => {
    setName("");
    setKeywordInput("");
    setKeywords([]);
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const addKeyword = (value?: string) => {
    const input = value ?? keywordInput;
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
    }
    setKeywordInput("");
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleInputChange = (value: string) => {
    // Check if comma was typed - process the keyword before the comma
    if (value.includes(",")) {
      const parts = value.split(",");
      const beforeComma = parts[0];
      if (beforeComma.trim()) {
        addKeyword(beforeComma);
      } else {
        setKeywordInput("");
      }
    } else {
      setKeywordInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (keywords.length === 0) {
      setError("At least one keyword is required");
      return;
    }

    createMutation.mutate({ name: name.trim(), keywords });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Keyword Set</DialogTitle>
            <DialogDescription>
              Define a group of keywords to monitor. These will be matched
              against content in your target subreddits.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., SaaS Pain Points"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  placeholder="Type keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={50}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addKeyword()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Press Enter or comma to add each keyword
              </p>

              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="hover:bg-muted ml-1 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
