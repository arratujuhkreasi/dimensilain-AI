"use client";

import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store/project-store";
import { useScriptStore } from "@/lib/store/script-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUB_GENRE_LABELS, DURATION_CONFIG } from "@/lib/utils/duration-config";
import { projectConfigSchema } from "@/lib/validators/project-schema";
import { Sparkles } from "lucide-react";
import { nanoid } from "nanoid";

export function StepReview() {
  const router = useRouter();
  const { config } = useProjectStore();
  const { setScreenplay } = useScriptStore();
  const durConfig = DURATION_CONFIG[config.duration];
  const validation = projectConfigSchema.safeParse(config);

  const handleGenerate = () => {
    if (!validation.success) return;

    const id = nanoid();
    setScreenplay({
      id,
      projectConfig: config,
      acts: [],
      createdAt: new Date().toISOString(),
      status: "outline",
    });
    router.push(`/script/${id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Proyek</h2>
        <p className="text-muted-foreground mt-1">Cek singkat sebelum naskah dibuat</p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="p-4 rounded-lg border border-border space-y-2">
          <h3 className="font-semibold text-lg">{config.title || "Belum ada judul"}</h3>
          <p className="text-muted-foreground">{config.logline || "Belum ada logline"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted">
            <span className="text-muted-foreground">Genre:</span>{" "}
            <Badge variant="secondary">{SUB_GENRE_LABELS[config.subGenre]}</Badge>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <span className="text-muted-foreground">Durasi:</span>{" "}
            <span className="font-medium">{config.duration} menit</span>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <span className="text-muted-foreground">Struktur:</span>{" "}
            <span className="font-medium">
              {durConfig.acts} Act x {durConfig.scenesPerAct} Scene
            </span>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <span className="text-muted-foreground">Horor:</span>{" "}
            <span className="font-medium capitalize">{config.jumpScareDensity}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted">
          <span className="text-muted-foreground">Karakter:</span>{" "}
          {config.characters.length > 0
            ? config.characters.map((c) => c.name || "Tanpa nama").join(", ")
            : "Belum ada karakter"}
        </div>

        <div className="p-3 rounded-lg bg-muted">
          <span className="text-muted-foreground">Setting:</span>{" "}
          {config.setting || "Belum ditentukan"}
        </div>

        {config.constraints.additionalNotes && (
          <div className="p-3 rounded-lg bg-muted">
            <span className="text-muted-foreground">Catatan:</span>{" "}
            {config.constraints.additionalNotes}
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={handleGenerate}
        disabled={!validation.success}
        className="w-full bg-blood hover:bg-blood/90 text-blood-foreground"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Naskah
      </Button>
      {!validation.success && (
        <p className="text-center text-xs text-muted-foreground">
          Lengkapi judul, logline, lokasi, dan minimal satu nama karakter sebelum generate.
        </p>
      )}
    </div>
  );
}
