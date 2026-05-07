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

export type SceneRevisionStatus = "draft" | "reviewed" | "needs-revision" | "approved";

export interface SceneComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Scene {
  id: string;
  actNumber: number;
  sceneNumber: number;
  heading: string;
  summary: string;
  elements: SceneElement[];
  status: "pending" | "generating" | "complete" | "error";
  revisionStatus?: SceneRevisionStatus;
  comments?: SceneComment[];
  productionNote?: string;
  shotIntent?: string;
  rewriteNote?: string;
}

export interface Act {
  actNumber: number;
  title: string;
  scenes: Scene[];
}

export interface ScreenplayVersion {
  id: string;
  label: string;
  createdAt: string;
  acts: Act[];
  revisionNotes?: string;
}

export interface Screenplay {
  id: string;
  projectConfig: import("./project").ProjectConfig;
  acts: Act[];
  createdAt: string;
  status: "outline" | "generating" | "complete";
  revisionNotes?: string;
  productionNotes?: string;
  versions?: ScreenplayVersion[];
}
