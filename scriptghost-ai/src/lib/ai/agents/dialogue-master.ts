import { getLlm } from "../cerebras-client";
import { dialoguePrompt } from "../prompts/dialogue-prompt";
import type { ProjectConfig } from "@/lib/types/project";
import type { Scene } from "@/lib/types/screenplay";

interface DialogueInput {
  projectConfig: ProjectConfig;
  scene: Scene;
  researchContext: string;
  previousSceneSummary: string;
}

export async function runDialogueMaster(input: DialogueInput): Promise<string> {
  const { projectConfig, scene, researchContext, previousSceneSummary } = input;

  const characterList = projectConfig.characters
    .map(formatCharacterBrief)
    .join("\n");

  const chain = dialoguePrompt.pipe(getLlm());

  const result = await chain.invoke({
    jumpScareDensity: projectConfig.jumpScareDensity,
    sceneHeading: scene.heading,
    sceneSummary: scene.summary,
    researchContext,
    characterList,
    previousSceneSummary: previousSceneSummary || "Ini adalah scene pertama.",
  });

  return typeof result.content === "string" ? result.content : "";
}

export async function* streamDialogueMaster(input: DialogueInput): AsyncGenerator<string> {
  const { projectConfig, scene, researchContext, previousSceneSummary } = input;

  const characterList = projectConfig.characters
    .map(formatCharacterBrief)
    .join("\n");

  const chain = dialoguePrompt.pipe(getLlm());

  const stream = await chain.stream({
    jumpScareDensity: projectConfig.jumpScareDensity,
    sceneHeading: scene.heading,
    sceneSummary: scene.summary,
    researchContext,
    characterList,
    previousSceneSummary: previousSceneSummary || "Ini adalah scene pertama.",
  });

  for await (const chunk of stream) {
    const content = typeof chunk.content === "string" ? chunk.content : "";
    if (content) yield content;
  }
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
