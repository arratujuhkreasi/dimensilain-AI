export type SceneElementType =
  | "scene-heading"
  | "action"
  | "character-name"
  | "dialogue"
  | "parenthetical"
  | "transition";

export interface SceneElement {
  type: SceneElementType;
  content: string;
}

export interface Scene {
  id: string;
  actNumber: number;
  sceneNumber: number;
  heading: string;
  summary: string;
  elements: SceneElement[];
  status: "pending" | "generating" | "complete" | "error";
}

export interface Act {
  actNumber: number;
  title: string;
  scenes: Scene[];
}

export interface Screenplay {
  id: string;
  projectConfig: import("./project").ProjectConfig;
  acts: Act[];
  createdAt: string;
  status: "outline" | "generating" | "complete";
}
