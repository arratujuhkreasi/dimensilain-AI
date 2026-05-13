import { getLlmStructured } from "../cerebras-client";
import { architectPrompt } from "../prompts/architect-prompt";
import { DURATION_CONFIG } from "@/lib/utils/duration-config";
import type { ProjectConfig } from "@/lib/types/project";
import type { Act } from "@/lib/types/screenplay";
import { nanoid } from "nanoid";

export async function runArchitect(projectConfig: ProjectConfig): Promise<Act[]> {
  const durConfig = DURATION_CONFIG[projectConfig.duration];

  const characterList = projectConfig.characters
    .map(formatCharacterBrief)
    .join("\n");

  const chain = architectPrompt.pipe(getLlmStructured());

  const result = await chain.invoke({
    actCount: durConfig.acts,
    scenesPerAct: durConfig.scenesPerAct,
    maxLocations: projectConfig.constraints.maxLocations,
    maxActors: projectConfig.constraints.maxActors,
    jumpScareDensity: projectConfig.jumpScareDensity,
    subGenre: projectConfig.subGenre,
    title: projectConfig.title,
    logline: projectConfig.logline,
    setting: projectConfig.setting,
    settingDetails: projectConfig.settingDetails || "Tidak ada detail tambahan",
    duration: projectConfig.duration,
    additionalNotes: projectConfig.constraints.additionalNotes || "Tidak ada",
    characterList,
  });

  const content = typeof result.content === "string" ? result.content : "";
  const parsed = parseArchitectJson(content) ?? createFallbackOutline(projectConfig);

  return parsed.acts.map((act) => ({
    actNumber: act.actNumber,
    title: act.title,
    scenes: act.scenes.map((scene) => ({
      id: nanoid(),
      actNumber: act.actNumber,
      sceneNumber: scene.sceneNumber,
      heading: scene.heading,
      summary: scene.summary,
      elements: [],
      status: "pending" as const,
    })),
  }));
}

function formatCharacterBrief(character: ProjectConfig["characters"][number]) {
  const details = [
    character.ageRange && `Usia talent: ${character.ageRange}`,
    character.talentCriteria && `Kriteria talent: ${character.talentCriteria}`,
    character.physicalDescription && `Ciri visual: ${character.physicalDescription}`,
    character.weakness && `Konflik/ketakutan: ${character.weakness}`,
    character.specialSkills && `Skill/aksi khusus: ${character.specialSkills}`,
  ]
    .filter(Boolean)
    .join(". ");

  return `- ${character.name} (${character.role})${details ? `: ${details}` : ""}`;
}

function parseArchitectJson(content: string):
  | {
      acts: {
        actNumber: number;
        title: string;
        scenes: { sceneNumber: number; heading: string; summary: string }[];
      }[];
    }
  | null {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      acts?: {
        actNumber?: number;
        title?: string;
        scenes?: { sceneNumber?: number; heading?: string; summary?: string }[];
      }[];
    };

    if (!Array.isArray(parsed.acts)) return null;

    return {
      acts: parsed.acts.map((act, actIndex) => ({
        actNumber: Number(act.actNumber) || actIndex + 1,
        title: act.title || `Act ${actIndex + 1}`,
        scenes: Array.isArray(act.scenes)
          ? act.scenes.map((scene, sceneIndex) => ({
              sceneNumber: Number(scene.sceneNumber) || sceneIndex + 1,
              heading: scene.heading || "INT. LOKASI UTAMA - MALAM",
              summary: scene.summary || "Ketegangan meningkat dan misteri semakin jelas.",
            }))
          : [],
      })),
    };
  } catch {
    return null;
  }
}

function createFallbackOutline(projectConfig: ProjectConfig) {
  const durConfig = DURATION_CONFIG[projectConfig.duration];
  const actTitles =
    durConfig.acts === 3
      ? ["Pengenalan Teror", "Konfrontasi", "Puncak Kengerian"]
      : ["Pemicu", "Penyelidikan", "Pengungkapan", "Kejaran", "Konfrontasi Akhir"];

  return {
    acts: Array.from({ length: durConfig.acts }, (_, actIndex) => ({
      actNumber: actIndex + 1,
      title: actTitles[actIndex] || `Act ${actIndex + 1}`,
      scenes: Array.from({ length: durConfig.scenesPerAct }, (_, sceneIndex) => ({
        sceneNumber: sceneIndex + 1,
        heading: buildFallbackHeading(projectConfig.setting, actIndex, sceneIndex),
        summary: buildFallbackSummary(projectConfig, actIndex, sceneIndex, durConfig.acts),
      })),
    })),
  };
}

function buildFallbackHeading(setting: string, actIndex: number, sceneIndex: number) {
  const time = actIndex === 0 && sceneIndex === 0 ? "SORE" : "MALAM";
  return `INT. ${setting || "LOKASI UTAMA"} - ${time}`.toUpperCase();
}

function buildFallbackSummary(
  projectConfig: ProjectConfig,
  actIndex: number,
  sceneIndex: number,
  actCount: number
) {
  const mainCharacter = projectConfig.characters[0]?.name || "karakter utama";
  const isOpening = actIndex === 0 && sceneIndex === 0;
  const isFinal = actIndex === actCount - 1;

  if (isOpening) {
    return `${mainCharacter} tiba di ${projectConfig.setting} dan menemukan tanda pertama dari teror yang berhubungan dengan logline: ${projectConfig.logline}`;
  }

  if (isFinal) {
    return `${mainCharacter} menghadapi sumber gangguan supernatural, memanfaatkan kelemahan karakter sebagai konflik emosional utama.`;
  }

  return `Misteri di ${projectConfig.setting} berkembang, petunjuk baru muncul, dan tekanan horor meningkat sesuai sub-genre ${projectConfig.subGenre}.`;
}
