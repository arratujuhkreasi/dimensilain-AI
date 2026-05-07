"use client";

import { useProjectStore } from "@/lib/store/project-store";
import type { SubGenre } from "@/lib/types/project";
import { SUB_GENRE_LABELS } from "@/lib/utils/duration-config";
import { Ghost, Eye, Brain, Video, Skull, Eclipse, TreePine } from "lucide-react";

const GENRE_ICONS: Record<SubGenre, React.ReactNode> = {
  gore: <Skull className="h-6 w-6" />,
  supernatural: <Ghost className="h-6 w-6" />,
  psychological: <Brain className="h-6 w-6" />,
  "found-footage": <Video className="h-6 w-6" />,
  slasher: <Eye className="h-6 w-6" />,
  "cosmic-horror": <Eclipse className="h-6 w-6" />,
  "folk-horror": <TreePine className="h-6 w-6" />,
};

export function StepGenre() {
  const { config, setSubGenre } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sub-Genre Horor</h2>
        <p className="text-muted-foreground mt-1">Pilih nuansa horor yang diinginkan</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.keys(SUB_GENRE_LABELS) as SubGenre[]).map((genre) => (
          <button
            key={genre}
            onClick={() => setSubGenre(genre)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
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
    </div>
  );
}
