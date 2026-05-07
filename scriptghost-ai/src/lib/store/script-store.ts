import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Act, Scene, Screenplay } from "@/lib/types/screenplay";
import type { AgentName } from "@/lib/types/agents";

interface ScriptStore {
  screenplay: Screenplay | null;
  currentAgent: AgentName;
  isGenerating: boolean;
  generationProgress: { completed: number; total: number };
  streamingContent: string;

  setScreenplay: (screenplay: Screenplay) => void;
  setOutline: (acts: Act[]) => void;
  updateScene: (sceneId: string, data: Partial<Scene>) => void;
  updateSceneElement: (sceneId: string, elementIndex: number, content: string) => void;
  replaceAllText: (findText: string, replaceText: string, caseSensitive?: boolean) => number;
  setRevisionNotes: (notes: string) => void;
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

      setScreenplay: (screenplay) => set({ screenplay }),

      setOutline: (acts) =>
        set((s) => {
          if (!s.screenplay) return s;
          return { screenplay: { ...s.screenplay, acts, status: "generating" } };
        }),

      updateScene: (sceneId, data) =>
        set((s) => {
          if (!s.screenplay) return s;
          const acts = s.screenplay.acts.map((act) => ({
            ...act,
            scenes: act.scenes.map((scene) =>
              scene.id === sceneId ? { ...scene, ...data } : scene
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
              physicalDescription: replaceValue(character.physicalDescription),
              weakness: replaceValue(character.weakness),
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
            },
          };
        });

        return replacementCount;
      },

      setRevisionNotes: (revisionNotes) =>
        set((s) => ({
          screenplay: s.screenplay ? { ...s.screenplay, revisionNotes } : null,
        })),

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
