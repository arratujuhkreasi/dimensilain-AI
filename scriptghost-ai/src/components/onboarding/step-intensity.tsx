"use client";

import { useProjectStore } from "@/lib/store/project-store";
import type { JumpScareDensity } from "@/lib/types/project";
import { JUMP_SCARE_LABELS } from "@/lib/utils/duration-config";
import { Volume1, Volume2, VolumeX } from "lucide-react";

const INTENSITY_OPTIONS: { value: JumpScareDensity; icon: React.ReactNode }[] = [
  { value: "low", icon: <Volume1 className="h-6 w-6" /> },
  { value: "medium", icon: <Volume2 className="h-6 w-6" /> },
  { value: "extreme", icon: <VolumeX className="h-6 w-6" /> },
];

export function StepIntensity() {
  const { config, setJumpScareDensity } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Jump Scare Density</h2>
        <p className="text-muted-foreground mt-1">Level intensitas ketakutan dalam naskah</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {INTENSITY_OPTIONS.map(({ value, icon }) => (
          <button
            key={value}
            onClick={() => setJumpScareDensity(value)}
            className={`flex flex-col items-center gap-3 p-6 rounded-lg border transition-all ${
              config.jumpScareDensity === value
                ? "border-blood bg-blood/10 text-blood"
                : "border-border hover:border-blood/50"
            }`}
          >
            {icon}
            <span className="text-sm font-medium text-center">
              {JUMP_SCARE_LABELS[value]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
