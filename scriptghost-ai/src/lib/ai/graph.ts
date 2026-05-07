import { runArchitect } from "./agents/architect";
import { runResearcher } from "./agents/researcher";
import { runDialogueMaster } from "./agents/dialogue-master";
import { runFormatSpecialist } from "./agents/format-specialist";
import type { ProjectConfig } from "@/lib/types/project";
import type { Act, Scene, SceneElement } from "@/lib/types/screenplay";

export interface PipelineCallbacks {
  onAgentChange: (agent: string) => void;
  onSceneStart: (actNumber: number, sceneNumber: number) => void;
  onToken: (token: string) => void;
  onSceneComplete: (sceneId: string, elements: SceneElement[]) => void;
  onOutlineComplete: (acts: Act[]) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function parseFormattedScene(formatted: string): SceneElement[] {
  const elements: SceneElement[] = [];
  const lines = formatted.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("[SCENE_HEADING]")) {
      elements.push({ type: "scene-heading", content: trimmed.replace("[SCENE_HEADING]", "").trim() });
    } else if (trimmed.startsWith("[ACTION]")) {
      elements.push({ type: "action", content: trimmed.replace("[ACTION]", "").trim() });
    } else if (trimmed.startsWith("[CHARACTER]")) {
      elements.push({ type: "character-name", content: trimmed.replace("[CHARACTER]", "").trim() });
    } else if (trimmed.startsWith("[PARENTHETICAL]")) {
      elements.push({ type: "parenthetical", content: trimmed.replace("[PARENTHETICAL]", "").trim() });
    } else if (trimmed.startsWith("[DIALOGUE]")) {
      elements.push({ type: "dialogue", content: trimmed.replace("[DIALOGUE]", "").trim() });
    } else if (trimmed.startsWith("[TRANSITION]")) {
      elements.push({ type: "transition", content: trimmed.replace("[TRANSITION]", "").trim() });
    } else {
      elements.push({ type: "action", content: trimmed });
    }
  }

  return elements;
}

export async function runFullPipeline(
  projectConfig: ProjectConfig,
  callbacks: PipelineCallbacks
) {
  try {
    callbacks.onAgentChange("architect");
    const acts = await runArchitect(projectConfig);
    callbacks.onOutlineComplete(acts);

    const allScenes: Scene[] = acts.flatMap((act) => act.scenes);
    let previousSummary = "";

    for (let i = 0; i < allScenes.length; i++) {
      const scene = allScenes[i];
      callbacks.onSceneStart(scene.actNumber, scene.sceneNumber);

      callbacks.onAgentChange("researcher");
      const researchContext = await runResearcher({
        projectConfig,
        scene,
        outline: acts,
        previousSceneSummary: previousSummary,
      });

      callbacks.onAgentChange("dialogue");
      const rawScene = await runDialogueMaster({
        projectConfig,
        scene,
        researchContext,
        previousSceneSummary: previousSummary,
      });

      callbacks.onAgentChange("format");
      const formatted = await runFormatSpecialist(rawScene);

      const elements = parseFormattedScene(formatted);
      callbacks.onSceneComplete(scene.id, elements);

      previousSummary = scene.summary;
    }

    callbacks.onComplete();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function runOutlineOnly(projectConfig: ProjectConfig): Promise<Act[]> {
  return runArchitect(projectConfig);
}

export async function* runScenePipeline(
  projectConfig: ProjectConfig,
  scene: Scene,
  outline: Act[],
  previousSceneSummary: string
): AsyncGenerator<{ type: "agent" | "token" | "complete"; data: string }> {
  yield { type: "agent", data: "researcher" };
  const researchContext = await runResearcher({
    projectConfig,
    scene,
    outline,
    previousSceneSummary,
  });

  yield { type: "agent", data: "dialogue" };
  const rawScene = await runDialogueMaster({
    projectConfig,
    scene,
    researchContext,
    previousSceneSummary,
  });

  yield { type: "agent", data: "format" };
  const formatted = await runFormatSpecialist(rawScene);

  for (const char of formatted) {
    yield { type: "token", data: char };
  }

  yield { type: "complete", data: formatted };
}
