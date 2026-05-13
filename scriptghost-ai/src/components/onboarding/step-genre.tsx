"use client";

import { useProjectStore } from "@/lib/store/project-store";
import type { Duration, JumpScareDensity, SubGenre } from "@/lib/types/project";
import { DURATION_CONFIG, JUMP_SCARE_LABELS, SUB_GENRE_LABELS } from "@/lib/utils/duration-config";
import { Brain, Clock, Eclipse, Eye, Ghost, Skull, TreePine, Video, Volume1, Volume2, Zap } from "lucide-react";

const GENRE_ICONS: Record<SubGenre, React.ReactNode> = {
  gore: <Skull className="h-5 w-5" />,
  supernatural: <Ghost className="h-5 w-5" />,
  psychological: <Brain className="h-5 w-5" />,
  "found-footage": <Video className="h-5 w-5" />,
  slasher: <Eye className="h-5 w-5" />,
  "cosmic-horror": <Eclipse className="h-5 w-5" />,
  "folk-horror": <TreePine className="h-5 w-5" />,
};

const DURATIONS: { value: Duration; label: string }[] = [
  { value: 15, label: "15 menit" },
  { value: 30, label: "30 menit" },
  { value: 60, label: "60 menit" },
  { value: 90, label: "90 menit" },
];

const INTENSITY_OPTIONS: { value: JumpScareDensity; icon: React.ReactNode }[] = [
  { value: "low", icon: <Volume1 className="h-5 w-5" /> },
  { value: "medium", icon: <Volume2 className="h-5 w-5" /> },
  { value: "extreme", icon: <Zap className="h-5 w-5" /> },
];

export function StepGenre() {
  const { config, setDuration, setJumpScareDensity, setSubGenre } = useProjectStore();
  const selected = DURATION_CONFIG[config.duration];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Gaya Naskah</h2>
        <p className="text-muted-foreground mt-1">
          Pilih rasa cerita, panjang naskah, dan intensitasnya.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Sub-genre</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.keys(SUB_GENRE_LABELS) as SubGenre[]).map((genre) => (
            <button
              key={genre}
              type="button"
              aria-pressed={config.subGenre === genre}
              onClick={() => setSubGenre(genre)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center transition-all ${
                config.subGenre === genre
                  ? "border-blood bg-blood/10 text-blood"
                  : "border-border hover:border-blood/50"
              }`}
            >
              {GENRE_ICONS[genre]}
              <span className="text-sm font-medium">{SUB_GENRE_LABELS[genre]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Durasi</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DURATIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={config.duration === value}
              onClick={() => setDuration(value)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                config.duration === value
                  ? "border-blood bg-blood/10 text-blood"
                  : "border-border hover:border-blood/50"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Akan dibuat sekitar{" "}
          <span className="font-medium text-foreground">
            {selected.acts * selected.scenesPerAct} scene
          </span>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Intensitas horor</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {INTENSITY_OPTIONS.map(({ value, icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={config.jumpScareDensity === value}
              onClick={() => setJumpScareDensity(value)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all sm:flex-col sm:text-center ${
                config.jumpScareDensity === value
                  ? "border-blood bg-blood/10 text-blood"
                  : "border-border hover:border-blood/50"
              }`}
            >
              {icon}
              <span className="text-sm font-medium">{JUMP_SCARE_LABELS[value]}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
