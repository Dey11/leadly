"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client/api";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function IcpCreationStepper() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    targetPersona: "",
    pains: "",
    valueProposition: "Leadly helps you find customers.", // Default or empty
    summary: "ICP created via wizard.", // Default or computed
    qualifyingSignals: "",
    disqualifyingSignals: "",
    platform: "REDDIT" as const,
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const mutation = useMutation({
    mutationFn: async () => {
      return clientApi.createIcp(formData);
    },
    onSuccess: () => {
      router.push("/dashboard/icps");
      router.refresh();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create ICP");
    },
  });

  const handleSubmit = () => {
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl py-12">
      <div className="text-muted-foreground mb-8 flex items-center justify-between text-sm font-medium">
        <div className="text-primary flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
            1
          </div>
          <span>Basics</span>
        </div>
        <div className="bg-border h-[2px] w-12" />
        <div
          className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : ""}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
            2
          </div>
          <span>Pains</span>
        </div>
        <div className="bg-border h-[2px] w-12" />
        <div
          className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : ""}`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-current">
            3
          </div>
          <span>Signals</span>
        </div>
      </div>

      <Card className="border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-lg backdrop-blur">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Who are you targeting?</h2>
                  <p className="text-muted-foreground">
                    Start by defining the persona you want to reach.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ICP Name (Internal)</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Series A Founders"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="persona">Target Persona Role</Label>
                    <Input
                      id="persona"
                      placeholder="e.g. CTO, VP of Engineering"
                      value={formData.targetPersona}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetPersona: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Brief Summary</Label>
                    <Textarea
                      id="summary"
                      placeholder="What do you offer them?"
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    What keeps them up at night?
                  </h2>
                  <p className="text-muted-foreground">
                    Leadly looks for complaints and questions related to these
                    pains.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pains">Key Pain Points</Label>
                    <Textarea
                      id="pains"
                      placeholder="e.g. High AWS bills, difficulty hiring engineers..."
                      className="min-h-[150px]"
                      value={formData.pains}
                      onChange={(e) =>
                        setFormData({ ...formData, pains: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valueProp">Value Proposition</Label>
                    <Textarea
                      id="valueProp"
                      placeholder="How do you solve this?"
                      value={formData.valueProposition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          valueProposition: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Buying Signals</h2>
                  <p className="text-muted-foreground">
                    What keywords indicate they are ready to buy?
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signals">Qualifying Keywords/Phrases</Label>
                    <Textarea
                      id="signals"
                      placeholder="e.g. 'looking for alternative', 'pricing too high', 'recommendation for'"
                      className="min-h-[100px]"
                      value={formData.qualifyingSignals}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualifyingSignals: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neg-signals">
                      Negative Keywords (Optional)
                    </Label>
                    <Input
                      id="neg-signals"
                      placeholder="e.g. 'hiring', 'student', 'free'"
                      value={formData.disqualifyingSignals}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disqualifyingSignals: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={step === 1}
              className="text-muted-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create ICP"}{" "}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
