import { getLlmStructured } from "../cerebras-client";
import { architectPrompt } from "../prompts/architect-prompt";
import { DURATION_CONFIG } from "@/lib/utils/duration-config";
import type { ProjectConfig } from "@/lib/types/project";
import type { Act } from "@/lib/types/screenplay";
import { nanoid } from "nanoid";

export async function runArchitect(projectConfig: ProjectConfig): Promise<Act[]> {
  const durConfig = DURATION_CONFIG[projectConfig.duration];

  const characterList = projectConfig.characters
    .map((c) => `- ${c.name} (${c.role}): ${c.physicalDescription}. Kelemahan: ${c.weakness}`)
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
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Architect agent did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    acts: { actNumber: number; title: string; scenes: { sceneNumber: number; heading: string; summary: string }[] }[];
  };

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
