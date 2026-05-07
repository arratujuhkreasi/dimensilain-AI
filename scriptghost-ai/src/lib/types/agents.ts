import type { ProjectConfig } from "./project";
import type { Act, Scene } from "./screenplay";

export type AgentName = "architect" | "researcher" | "dialogue" | "format" | "idle";

export interface AgentState {
  projectConfig: ProjectConfig;
  outline: Act[];
  allScenes: Scene[];
  currentSceneIndex: number;
  currentSceneContent: string;
  researchContext: string;
  completedScenes: Scene[];
  currentAgent: AgentName;
  error?: string;
}
