"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Briefcase, Users, MessageSquare, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { clientApi } from "@/lib/client/api";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OCCUPATION_OPTIONS = [
  { value: "founder", label: "Founder / CEO" },
  { value: "marketer", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "developer", label: "Developer" },
  { value: "freelancer", label: "Freelancer" },
  { value: "agency", label: "Agency" },
  { value: "other", label: "Other" },
];

const REFERRER_OPTIONS = [
  { value: "google", label: "Google Search" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "friend", label: "Friend / Referral" },
  { value: "reddit", label: "Reddit" },
  { value: "other", label: "Other" },
];

export function ProfileSettings() {
  const queryClient = useQueryClient();

  const accountQuery = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await clientApi.getAccount();
      return response.payload.data;
    },
  });

  const [company, setCompany] = useState<string>("");
  const [occupation, setOccupation] = useState<string>("");
  const [referrer, setReferrer] = useState<string>("");
  const [sampleDm, setSampleDm] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form with account data
  useEffect(() => {
    if (accountQuery.data && !initialized) {
      setCompany(accountQuery.data.company || "");
      setOccupation(accountQuery.data.occupation || "");
      setReferrer(accountQuery.data.referrer || "");
      setSampleDm(accountQuery.data.sampleDm || "");
      setInitialized(true);
    }
  }, [accountQuery.data, initialized]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      company?: string;
      occupation?: string;
      referrer?: string;
      sampleDm?: string;
    }) => clientApi.updateProfile(data),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (error) => {
      toast.error("Failed to save settings", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      company: company || undefined,
      occupation: occupation || undefined,
      referrer: referrer || undefined,
      sampleDm: sampleDm || undefined,
    });
  };

  const hasChanges =
    company !== (accountQuery.data?.company || "") ||
    occupation !== (accountQuery.data?.occupation || "") ||
    referrer !== (accountQuery.data?.referrer || "") ||
    sampleDm !== (accountQuery.data?.sampleDm || "");

  if (accountQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 bg-background/85">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company
            </CardTitle>
            <CardDescription>
              Your company or business name for DM personalization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/85">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Role
            </CardTitle>
            <CardDescription>
              Your occupation helps us tailor the experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Your role</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {OCCUPATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/85 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sample DM
            </CardTitle>
            <CardDescription>
              Paste a sample cold DM. We'll match this tone when generating messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sampleDm">Your DM style</Label>
              <Textarea
                id="sampleDm"
                placeholder="Hey! Saw your post about... I run a [product] that helps with..."
                className="min-h-[120px] resize-none"
                value={sampleDm}
                onChange={(e) => setSampleDm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t bg-background/95 sticky bottom-0 -mx-4 -mb-8 mt-6 flex items-center justify-end p-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || !hasChanges}
          size="lg"
          className="shadow-lg"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}
