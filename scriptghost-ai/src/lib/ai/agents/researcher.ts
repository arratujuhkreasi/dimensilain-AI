import { getLlm } from "../cerebras-client";
import { researcherPrompt } from "../prompts/researcher-prompt";
import type { ProjectConfig } from "@/lib/types/project";
import type { Act, Scene } from "@/lib/types/screenplay";

interface ResearcherInput {
  projectConfig: ProjectConfig;
  scene: Scene;
  outline: Act[];
  previousSceneSummary: string;
}

export async function runResearcher(input: ResearcherInput): Promise<string> {
  const { projectConfig, scene, outline, previousSceneSummary } = input;

  const outlineSummary = outline
    .map(
      (act) =>
        `Act ${act.actNumber}: ${act.title}\n` +
        act.scenes.map((s) => `  Scene ${s.sceneNumber}: ${s.heading} — ${s.summary}`).join("\n")
    )
    .join("\n\n");

  const chain = researcherPrompt.pipe(getLlm());

  const result = await chain.invoke({
    subGenre: projectConfig.subGenre,
    sceneHeading: scene.heading,
    sceneSummary: scene.summary,
    actNumber: scene.actNumber,
    sceneNumber: scene.sceneNumber,
    setting: projectConfig.setting,
    involvedCharacters: projectConfig.characters.map((c) => c.name).join(", "),
    previousSceneSummary: previousSceneSummary || "Ini adalah scene pertama.",
    outlineSummary,
  });

  return typeof result.content === "string" ? result.content : "";
}
