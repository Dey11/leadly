"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Bell, Loader2, Lock, Save, Send, Webhook } from "lucide-react";

import { clientApi } from "@/lib/client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { LeadType } from "@/types/backend";

const DISCORD_WEBHOOK_PATTERN =
  /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d+\/[\w-]+\/?$/;

const LEAD_TYPE_META: Record<
  LeadType,
  { label: string; activeClass: string; inactiveClass: string }
> = {
  WARM: {
    label: "Warm",
    activeClass: "bg-primary text-primary-foreground border-primary",
    inactiveClass:
      "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  },
  NEUTRAL: {
    label: "Neutral",
    activeClass: "bg-yellow-500 text-white border-yellow-500",
    inactiveClass:
      "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20",
  },
  COLD: {
    label: "Cold",
    activeClass: "bg-foreground text-background border-foreground",
    inactiveClass:
      "bg-muted text-muted-foreground border-border hover:bg-muted/70",
  },
};

const LEAD_TYPE_ORDER: LeadType[] = ["WARM", "NEUTRAL", "COLD"];

export function NotificationSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const response = await clientApi.getNotificationSettings();
      return response;
    },
  });

  const [destination, setDestination] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [notifyLeadTypes, setNotifyLeadTypes] = useState<LeadType[]>([
    "WARM",
    "COLD",
    "NEUTRAL",
  ]);
  const [notifyKeywordMatches, setNotifyKeywordMatches] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settingsQuery.data && !initialized) {
      const { channel } = settingsQuery.data;
      setDestination(channel.destination);
      setEnabled(channel.enabled);
      setNotifyLeadTypes(channel.notifyLeadTypes);
      setNotifyKeywordMatches(channel.notifyKeywordMatches);
      setInitialized(true);
    }
  }, [settingsQuery.data, initialized]);

  const saveMutation = useMutation({
    mutationFn: () =>
      clientApi.saveNotificationChannel({
        destination: destination.trim(),
        enabled,
        notifyLeadTypes,
        notifyKeywordMatches,
      }),
    onSuccess: () => {
      toast.success("Notification settings saved");
      queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
    },
    onError: (error) => {
      toast.error("Failed to save notification settings", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: () =>
      clientApi.sendNotificationTestMessage({
        destination: destination.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Test message sent", {
        description: "Check your Discord channel for the alert.",
      });
    },
    onError: (error) => {
      toast.error("Failed to send test message", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    },
  });

  const toggleLeadType = (type: LeadType) => {
    setNotifyLeadTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const allowed = settingsQuery.data?.allowed ?? false;

  if (!allowed) {
    return (
      <Card className="border-border/60 bg-background/85">
        <CardHeader>
          <div className="bg-primary/10 text-primary mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="flex items-center gap-2">
            Real-time alerts (Discord)
          </CardTitle>
          <CardDescription>
            Get pinged in Discord the moment a monitor finds a qualifying lead.
            This feature is available on the Pro and Premium plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/settings?tab=billing">Upgrade to Pro</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const destinationTrimmed = destination.trim();
  const isValidDestination =
    destinationTrimmed.length === 0 ||
    DISCORD_WEBHOOK_PATTERN.test(destinationTrimmed);
  const hasLeadTypeError = notifyLeadTypes.length === 0;
  const canSave =
    destinationTrimmed.length > 0 &&
    isValidDestination &&
    !hasLeadTypeError &&
    !saveMutation.isPending;
  const canTest = destinationTrimmed.length > 0 && isValidDestination;

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 bg-background/85">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Discord webhook
          </CardTitle>
          <CardDescription>
            Paste a Discord webhook URL to receive lead alerts in a channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled" className="text-base">
                Enabled
              </Label>
              <p className="text-muted-foreground text-xs">
                Turn off to pause alerts without losing your setup.
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discord-webhook-url">Webhook URL</Label>
            <Input
              id="discord-webhook-url"
              placeholder="https://discord.com/api/webhooks/..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-invalid={!isValidDestination}
            />
            {!isValidDestination && (
              <p className="text-destructive text-xs">
                Enter a valid Discord webhook URL.
              </p>
            )}
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="setup" className="border-none">
              <AccordionTrigger className="text-muted-foreground py-1 text-xs hover:no-underline">
                How do I get a webhook URL?
              </AccordionTrigger>
              <AccordionContent>
                <ol className="text-muted-foreground list-decimal space-y-1 pl-4 text-xs">
                  <li>
                    In Discord, open Server Settings → Integrations → Webhooks.
                  </li>
                  <li>Click New Webhook.</li>
                  <li>Pick the channel that should receive lead alerts.</li>
                  <li>Click Copy Webhook URL.</li>
                  <li>Paste the URL above and save.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => testMutation.mutate()}
            disabled={!canTest || testMutation.isPending}
          >
            {testMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send test message
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/85">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            What triggers an alert
          </CardTitle>
          <CardDescription>
            Choose which lead types and matches send a Discord alert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ICP lead types</Label>
            <div className="flex flex-wrap gap-2">
              {LEAD_TYPE_ORDER.map((type) => {
                const meta = LEAD_TYPE_META[type];
                const isActive = notifyLeadTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleLeadType(type)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      isActive ? meta.activeClass : meta.inactiveClass,
                    )}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
            {hasLeadTypeError && (
              <p className="text-destructive text-xs">
                Select at least one lead type.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="notify-keyword-matches" className="text-base">
                Keyword matches
              </Label>
              <p className="text-muted-foreground text-xs">
                Alert when a keyword monitor finds a new match.
              </p>
            </div>
            <Switch
              id="notify-keyword-matches"
              checked={notifyKeywordMatches}
              onCheckedChange={setNotifyKeywordMatches}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-background/95 sticky bottom-0 -mx-4 mt-2 -mb-8 flex items-center justify-end border-t p-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!canSave}
          size="lg"
          className="shadow-lg"
        >
          {saveMutation.isPending ? (
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
