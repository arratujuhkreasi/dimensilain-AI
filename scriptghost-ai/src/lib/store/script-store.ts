import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Character } from "@/lib/types/project";
import type {
  Act,
  Scene,
  SceneComment,
  SceneRevisionStatus,
  Screenplay,
} from "@/lib/types/screenplay";
import type { AgentName } from "@/lib/types/agents";

interface ScriptStore {
  screenplay: Screenplay | null;
  currentAgent: AgentName;
  isGenerating: boolean;
  generationProgress: { completed: number; total: number };
  streamingContent: string;

  setScreenplay: (screenplay: Screenplay) => void;
  setOutline: (acts: Act[]) => void;
  updateCharacterProfile: (characterId: string, data: Partial<Character>) => void;
  updateScene: (sceneId: string, data: Partial<Scene>) => void;
  updateSceneElement: (sceneId: string, elementIndex: number, content: string) => void;
  setSceneRevisionStatus: (sceneId: string, status: SceneRevisionStatus) => void;
  addSceneComment: (sceneId: string, body: string, author?: string) => void;
  updateSceneComment: (sceneId: string, commentId: string, body: string) => void;
  setSceneProductionNote: (sceneId: string, note: string) => void;
  setSceneShotIntent: (sceneId: string, intent: string) => void;
  setSceneRewriteNote: (sceneId: string, note: string) => void;
  applyRewriteNote: (sceneId: string) => void;
  replaceAllText: (findText: string, replaceText: string, caseSensitive?: boolean) => number;
  setRevisionNotes: (notes: string) => void;
  setProductionNotes: (notes: string) => void;
  saveVersion: (label: string) => void;
  restoreVersion: (versionId: string) => void;
  setStatus: (status: Screenplay["status"]) => void;
  setCurrentAgent: (agent: AgentName) => void;
  setIsGenerating: (generating: boolean) => void;
  setProgress: (completed: number, total: number) => void;
  appendStreamContent: (content: string) => void;
  clearStreamContent: () => void;
  reset: () => void;
}

export const useScriptStore = create<ScriptStore>()(
  persist(
    (set) => ({
      screenplay: null,
      currentAgent: "idle",
      isGenerating: false,
      generationProgress: { completed: 0, total: 0 },
      streamingContent: "",

      setScreenplay: (screenplay) =>
        set({
          screenplay: {
            ...screenplay,
            acts: normalizeActs(screenplay.acts),
            versions: screenplay.versions || [],
          },
        }),

      setOutline: (acts) =>
        set((s) => {
          if (!s.screenplay) return s;
          return { screenplay: { ...s.screenplay, acts: normalizeActs(acts), status: "generating" } };
        }),

      updateCharacterProfile: (characterId, data) =>
        set((s) => {
          if (!s.screenplay) return s;

          return {
            screenplay: {
              ...s.screenplay,
              projectConfig: {
                ...s.screenplay.projectConfig,
                characters: s.screenplay.projectConfig.characters.map((character) =>
                  character.id === characterId ? { ...character, ...data } : character
                ),
              },
            },
          };
        }),

      updateScene: (sceneId, data) =>
        set((s) => {
          if (!s.screenplay) return s;
          const acts = s.screenplay.acts.map((act) => ({
            ...act,
            scenes: act.scenes.map((scene) =>
              scene.id === sceneId ? normalizeScene({ ...scene, ...data }) : scene
            ),
          }));
          const allScenes = acts.flatMap((act) => act.scenes);
          const status =
            allScenes.length > 0 && allScenes.every((scene) => scene.status === "complete")
              ? "complete"
              : s.screenplay.status;
          return { screenplay: { ...s.screenplay, acts, status } };
        }),

      updateSceneElement: (sceneId, elementIndex, content) =>
        set((s) => {
          if (!s.screenplay) return s;

          const acts = s.screenplay.acts.map((act) => ({
            ...act,
            scenes: act.scenes.map((scene) => {
              if (scene.id !== sceneId) return scene;

              return {
                ...scene,
                elements: scene.elements.map((element, index) =>
                  index === elementIndex ? { ...element, content } : element
                ),
              };
            }),
          }));

          return { screenplay: { ...s.screenplay, acts } };
        }),

      setSceneRevisionStatus: (sceneId, revisionStatus) =>
        set((s) => {
          if (!s.screenplay) return s;

          return {
            screenplay: {
              ...s.screenplay,
              acts: mapScene(s.screenplay.acts, sceneId, (scene) => ({
                ...scene,
                revisionStatus,
              })),
            },
          };
        }),

      addSceneComment: (sceneId, body, author = "Director") =>
        set((s) => {
          if (!s.screenplay || !body.trim()) return s;

          const comment: SceneComment = {
            id: nanoid(),
            author,
            body: body.trim(),
            createdAt: new Date().toISOString(),
          };

          return {
            screenplay: {
              ...s.screenplay,
              acts: mapScene(s.screenplay.acts, sceneId, (scene) => ({
                ...scene,
                comments: [...(scene.comments || []), comment],
              })),
            },
          };
        }),

      updateSceneComment: (sceneId, commentId, body) =>
        set((s) => {
          if (!s.screenplay) return s;

          return {
            screenplay: {
              ...s.screenplay,
              acts: mapScene(s.screenplay.acts, sceneId, (scene) => ({
                ...scene,
                comments: (scene.comments || []).map((comment) =>
                  comment.id === commentId ? { ...comment, body } : comment
                ),
              })),
            },
          };
        }),

      setSceneProductionNote: (sceneId, productionNote) =>
        set((s) =>
          s.screenplay
            ? {
                screenplay: {
                  ...s.screenplay,
                  acts: mapScene(s.screenplay.acts, sceneId, (scene) => ({
                    ...scene,
                    productionNote,
                  })),
                },
              }
            : s
        ),

      setSceneShotIntent: (sceneId, shotIntent) =>
        set((s) =>
          s.screenplay
            ? {
                screenplay: {
                  ...s.screenplay,
                  acts: mapScene(s.screenplay.acts, sceneId, (scene) => ({
                    ...scene,
                    shotIntent,
                  })),
                },
              }
            : s
        ),

      setSceneRewriteNote: (sceneId, rewriteNote) =>
        set((s) =>
          s.screenplay
            ? {
                screenplay: {
                  ...s.screenplay,
                  acts: mapScene(s.screenplay.acts, sceneId, (scene) => ({
                    ...scene,
                    rewriteNote,
                  })),
                },
              }
            : s
        ),

      applyRewriteNote: (sceneId) =>
        set((s) => {
          if (!s.screenplay) return s;

          return {
            screenplay: {
              ...s.screenplay,
              acts: mapScene(s.screenplay.acts, sceneId, (scene) => {
                const note = scene.rewriteNote?.trim();
                if (!note) return scene;

                const elements =
                  scene.elements.length > 0
                    ? scene.elements.map((element) =>
                        element.type === "action"
                          ? {
                              ...element,
                              content: `${element.content}\n\nREVISION PASS: ${note}`,
                            }
                          : element
                      )
                    : [
                        {
                          type: "action" as const,
                          content: `REVISION PASS: ${note}`,
                        },
                      ];

                return {
                  ...scene,
                  elements,
                  summary: `${scene.summary}\nRevision note: ${note}`,
                  revisionStatus: "needs-revision",
                };
              }),
            },
          };
        }),

      replaceAllText: (findText, replaceText, caseSensitive = false) => {
        let replacementCount = 0;
        const needle = findText.trim();

        if (!needle) return 0;

        set((s) => {
          if (!s.screenplay) return s;

          const replaceValue = (value: string) => {
            const flags = caseSensitive ? "g" : "gi";
            const pattern = new RegExp(escapeRegExp(needle), flags);
            const matches = value.match(pattern);
            if (matches) replacementCount += matches.length;
            return value.replace(pattern, replaceText);
          };

          const projectConfig = {
            ...s.screenplay.projectConfig,
            title: replaceValue(s.screenplay.projectConfig.title),
            logline: replaceValue(s.screenplay.projectConfig.logline),
            setting: replaceValue(s.screenplay.projectConfig.setting),
            settingDetails: replaceValue(s.screenplay.projectConfig.settingDetails),
            characters: s.screenplay.projectConfig.characters.map((character) => ({
              ...character,
              name: replaceValue(character.name),
              ageRange: replaceValue(character.ageRange ?? ""),
              talentCriteria: replaceValue(character.talentCriteria ?? ""),
              physicalDescription: replaceValue(character.physicalDescription),
              weakness: replaceValue(character.weakness),
              specialSkills: replaceValue(character.specialSkills ?? ""),
            })),
            constraints: {
              ...s.screenplay.projectConfig.constraints,
              additionalNotes: replaceValue(s.screenplay.projectConfig.constraints.additionalNotes),
            },
          };

          const acts = s.screenplay.acts.map((act) => ({
            ...act,
            title: replaceValue(act.title),
            scenes: act.scenes.map((scene) => ({
              ...scene,
              heading: replaceValue(scene.heading),
              summary: replaceValue(scene.summary),
              productionNote: scene.productionNote
                ? replaceValue(scene.productionNote)
                : scene.productionNote,
              shotIntent: scene.shotIntent ? replaceValue(scene.shotIntent) : scene.shotIntent,
              rewriteNote: scene.rewriteNote ? replaceValue(scene.rewriteNote) : scene.rewriteNote,
              comments: (scene.comments || []).map((comment) => ({
                ...comment,
                body: replaceValue(comment.body),
              })),
              elements: scene.elements.map((element) => ({
                ...element,
                content: replaceValue(element.content),
              })),
            })),
          }));

          return {
            screenplay: {
              ...s.screenplay,
              projectConfig,
              acts,
              revisionNotes: s.screenplay.revisionNotes
                ? replaceValue(s.screenplay.revisionNotes)
                : s.screenplay.revisionNotes,
              productionNotes: s.screenplay.productionNotes
                ? replaceValue(s.screenplay.productionNotes)
                : s.screenplay.productionNotes,
            },
          };
        });

        return replacementCount;
      },

      setRevisionNotes: (revisionNotes) =>
        set((s) => ({
          screenplay: s.screenplay ? { ...s.screenplay, revisionNotes } : null,
        })),

      setProductionNotes: (productionNotes) =>
        set((s) => ({
          screenplay: s.screenplay ? { ...s.screenplay, productionNotes } : null,
        })),

      saveVersion: (label) =>
        set((s) => {
          if (!s.screenplay) return s;

          return {
            screenplay: {
              ...s.screenplay,
              versions: [
                ...(s.screenplay.versions || []),
                {
                  id: nanoid(),
                  label: label.trim() || `Draft ${(s.screenplay.versions || []).length + 1}`,
                  createdAt: new Date().toISOString(),
                  acts: s.screenplay.acts,
                  revisionNotes: s.screenplay.revisionNotes,
                },
              ],
            },
          };
        }),

      restoreVersion: (versionId) =>
        set((s) => {
          if (!s.screenplay) return s;
          const version = (s.screenplay.versions || []).find((item) => item.id === versionId);
          if (!version) return s;

          return {
            screenplay: {
              ...s.screenplay,
              acts: normalizeActs(version.acts),
              revisionNotes: version.revisionNotes,
            },
          };
        }),

      setStatus: (status) =>
        set((s) => ({
          screenplay: s.screenplay ? { ...s.screenplay, status } : null,
        })),
      setCurrentAgent: (currentAgent) => set({ currentAgent }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setProgress: (completed, total) => set({ generationProgress: { completed, total } }),
      appendStreamContent: (content) =>
        set((s) => ({ streamingContent: s.streamingContent + content })),
      clearStreamContent: () => set({ streamingContent: "" }),
      reset: () =>
        set({
          screenplay: null,
          currentAgent: "idle",
          isGenerating: false,
          generationProgress: { completed: 0, total: 0 },
          streamingContent: "",
        }),
    }),
    {
      name: "scriptghost-script",
      partialize: (state) => ({ screenplay: state.screenplay }),
      onRehydrateStorage: () => (state) => {
        state?.setIsGenerating(false);
        state?.setCurrentAgent("idle");
        state?.clearStreamContent();
      },
    }
  )
);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapScene(acts: Act[], sceneId: string, updater: (scene: Scene) => Scene): Act[] {
  return acts.map((act) => ({
    ...act,
    scenes: act.scenes.map((scene) => (scene.id === sceneId ? normalizeScene(updater(scene)) : scene)),
  }));
}

function normalizeActs(acts: Act[]) {
  return acts.map((act) => ({
    ...act,
    scenes: act.scenes.map(normalizeScene),
  }));
}

function normalizeScene(scene: Scene): Scene {
  return {
    ...scene,
    revisionStatus: scene.revisionStatus || "draft",
    comments: scene.comments || [],
  };
}
