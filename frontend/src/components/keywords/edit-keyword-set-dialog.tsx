"use client";

import { useState, useEffect } from "react";
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
import type { KeywordSet } from "@/types/keyword";

interface EditKeywordSetDialogProps {
  keywordSet: KeywordSet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditKeywordSetDialog({
  keywordSet,
  open,
  onOpenChange,
  onSuccess,
}: EditKeywordSetDialogProps) {
  const [name, setName] = useState(keywordSet.name);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(keywordSet.keywords);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(keywordSet.name);
      setKeywords(keywordSet.keywords);
      setKeywordInput("");
      setError(null);
    }
  }, [open, keywordSet]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; keywords?: string[] }) =>
      clientApi.updateKeywordSet(keywordSet.id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: unknown) => {
      setError(
        err instanceof Error ? err.message : "Failed to update keyword set",
      );
    },
  });

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

    const updates: { name?: string; keywords?: string[] } = {};
    if (name.trim() !== keywordSet.name) {
      updates.name = name.trim();
    }
    if (JSON.stringify(keywords) !== JSON.stringify(keywordSet.keywords)) {
      updates.keywords = keywords;
    }

    if (Object.keys(updates).length === 0) {
      onOpenChange(false);
      return;
    }

    updateMutation.mutate(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Keyword Set</DialogTitle>
            <DialogDescription>
              Update the name or keywords in this set.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., SaaS Pain Points"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-keywords">Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-keywords"
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
