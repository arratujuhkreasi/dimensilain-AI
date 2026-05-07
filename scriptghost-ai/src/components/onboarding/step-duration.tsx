"use client";

import { useProjectStore } from "@/lib/store/project-store";
import type { Duration } from "@/lib/types/project";
import { DURATION_CONFIG } from "@/lib/utils/duration-config";
import { Clock } from "lucide-react";

const DURATIONS: { value: Duration; label: string }[] = [
  { value: 15, label: "15 Menit" },
  { value: 30, label: "30 Menit" },
  { value: 60, label: "60 Menit" },
  { value: 90, label: "90 Menit" },
];

export function StepDuration() {
  const { config, setDuration } = useProjectStore();
  const selected = DURATION_CONFIG[config.duration];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Durasi Film</h2>
        <p className="text-muted-foreground mt-1">
          Durasi menentukan jumlah Act dan Scene yang dihasilkan
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DURATIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDuration(value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
              config.duration === value
                ? "border-blood bg-blood/10 text-blood"
                : "border-border hover:border-blood/50"
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground">
        <p>
          Struktur: <span className="text-foreground font-medium">{selected.acts} Act</span> ×{" "}
          <span className="text-foreground font-medium">{selected.scenesPerAct} Scene</span> ={" "}
          <span className="text-amber-accent font-medium">
            ~{selected.acts * selected.scenesPerAct} Scene total
          </span>
        </p>
      </div>
    </div>
  );
}
