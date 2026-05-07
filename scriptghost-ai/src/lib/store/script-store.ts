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
