"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { StepTitle } from "./step-title";
import { StepGenre } from "./step-genre";
import { StepCharacters } from "./step-characters";
import { StepReview } from "./step-review";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { label: "Ide", component: StepTitle },
  { label: "Gaya", component: StepGenre },
  { label: "Karakter", component: StepCharacters },
  { label: "Tinjau", component: StepReview },
];

export function OnboardingWizard() {
  const { currentStep, nextStep, prevStep, setStep } = useProjectStore();
  const safeCurrentStep = Math.min(currentStep, STEPS.length - 1);
  const StepComponent = STEPS[safeCurrentStep].component;

  useEffect(() => {
    if (currentStep !== safeCurrentStep) {
      setStep(safeCurrentStep);
    }
  }, [currentStep, safeCurrentStep, setStep]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="space-y-2">
            <div
              className={`h-2 rounded-full transition-colors ${
                i <= safeCurrentStep ? "bg-blood" : "bg-muted"
              }`}
            />
            <p className={`text-center text-xs ${i === safeCurrentStep ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Langkah {safeCurrentStep + 1} dari {STEPS.length} -{" "}
        <span className="text-foreground">{STEPS[safeCurrentStep].label}</span>
      </p>

      <div className="min-h-[400px]">
        <StepComponent />
      </div>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={safeCurrentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>

        {safeCurrentStep < STEPS.length - 1 && (
          <Button onClick={nextStep} className="bg-blood hover:bg-blood/90 text-blood-foreground">
            Lanjut
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
