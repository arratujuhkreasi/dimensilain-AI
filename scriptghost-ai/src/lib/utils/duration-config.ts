import type { Duration } from "@/lib/types/project";

export const DURATION_CONFIG: Record<Duration, { acts: number; scenesPerAct: number }> = {
  15: { acts: 3, scenesPerAct: 3 },
  30: { acts: 3, scenesPerAct: 5 },
  60: { acts: 5, scenesPerAct: 5 },
  90: { acts: 5, scenesPerAct: 7 },
};

export const SUB_GENRE_LABELS: Record<string, string> = {
  gore: "Gore",
  supernatural: "Supernatural",
  psychological: "Psychological",
  "found-footage": "Found Footage",
  slasher: "Slasher",
  "cosmic-horror": "Cosmic Horror",
  "folk-horror": "Folk Horror",
};

export const JUMP_SCARE_LABELS: Record<string, string> = {
  low: "Low — Atmosferik & Slow Burn",
  medium: "Medium — Seimbang",
  extreme: "Extreme — Intensif & Relentless",
};
