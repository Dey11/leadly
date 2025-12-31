"use client";

import { useState } from "react";
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
import { Sparkles, PenTool } from "lucide-react";

export default function CreateIcpPage() {
  const [mode, setMode] = useState<"ai" | "manual" | null>(null);

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
          <div className="bg-muted/30 border-border/60 rounded-xl border p-12 text-center">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              AI Generator Coming Soon
            </h3>
            <p className="text-muted-foreground mx-auto max-w-md">
              We are putting the finishing touches on our autonomous ICP
              generator. For now, please use the manual setup wizard.
            </p>
            <Button onClick={() => setMode("manual")} className="mt-6">
              Switch to Manual Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
