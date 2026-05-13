import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  ProjectConfig,
  SubGenre,
  Duration,
  JumpScareDensity,
  Character,
  ProductionConstraints,
} from "@/lib/types/project";

interface ProjectStore {
  config: ProjectConfig;
  currentStep: number;
  setTitle: (title: string) => void;
  setLogline: (logline: string) => void;
  setSubGenre: (genre: SubGenre) => void;
  addCharacter: () => void;
  updateCharacter: (id: string, data: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  setSetting: (setting: string) => void;
  setSettingDetails: (details: string) => void;
  setDuration: (duration: Duration) => void;
  setJumpScareDensity: (density: JumpScareDensity) => void;
  setConstraints: (constraints: Partial<ProductionConstraints>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

function createDefaultConfig(): ProjectConfig {
  return {
    title: "",
    logline: "",
    subGenre: "supernatural",
    characters: [],
    setting: "",
    settingDetails: "",
    duration: 30,
    jumpScareDensity: "medium",
    constraints: {
      maxLocations: 3,
      maxActors: 5,
      additionalNotes: "",
    },
  };
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      config: createDefaultConfig(),
      currentStep: 0,

      setTitle: (title) => set((s) => ({ config: { ...s.config, title } })),
      setLogline: (logline) => set((s) => ({ config: { ...s.config, logline } })),
      setSubGenre: (subGenre) => set((s) => ({ config: { ...s.config, subGenre } })),

      addCharacter: () =>
        set((s) => ({
          config: {
            ...s.config,
            characters: [
              ...s.config.characters,
              {
                id: nanoid(),
                name: "",
                ageRange: "",
                talentCriteria: "",
                physicalDescription: "",
                weakness: "",
                specialSkills: "",
                role: s.config.characters.length === 0 ? "protagonist" : "supporting",
              },
            ],
          },
        })),

      updateCharacter: (id, data) =>
        set((s) => ({
          config: {
            ...s.config,
            characters: s.config.characters.map((c) => (c.id === id ? { ...c, ...data } : c)),
          },
        })),

      removeCharacter: (id) =>
        set((s) => ({
          config: {
            ...s.config,
            characters: s.config.characters.filter((c) => c.id !== id),
          },
        })),

      setSetting: (setting) => set((s) => ({ config: { ...s.config, setting } })),
      setSettingDetails: (settingDetails) =>
        set((s) => ({ config: { ...s.config, settingDetails } })),
      setDuration: (duration) => set((s) => ({ config: { ...s.config, duration } })),
      setJumpScareDensity: (jumpScareDensity) =>
        set((s) => ({ config: { ...s.config, jumpScareDensity } })),

      setConstraints: (constraints) =>
        set((s) => ({
          config: { ...s.config, constraints: { ...s.config.constraints, ...constraints } },
        })),

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
      prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      reset: () => set({ config: createDefaultConfig(), currentStep: 0 }),
    }),
    {
      name: "scriptghost-project",
      partialize: (state) => ({ config: state.config, currentStep: state.currentStep }),
    }
  )
);
