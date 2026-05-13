"use client";

import { useCallback, useRef } from "react";
import { useScriptStore } from "@/lib/store/script-store";
import type { ProjectConfig } from "@/lib/types/project";
import type { Act, Scene, SceneElement } from "@/lib/types/screenplay";

export function useGenerationStream() {
  const abortRef = useRef<AbortController | null>(null);
  const {
    setCurrentAgent,
    setIsGenerating,
    setProgress,
    setOutline,
    updateScene,
    setStatus,
    appendStreamContent,
    clearStreamContent,
  } = useScriptStore();

  const generateOutline = useCallback(
    async (projectConfig: ProjectConfig) => {
      setIsGenerating(true);
      setCurrentAgent("architect");

      try {
        const res = await fetch("/api/generate-outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectConfig }),
        });

        if (!res.ok) {
          throw new Error("Gagal membuat kerangka cerita");
        }

        const data = await res.json();
        setOutline(data.outline);
        return data.outline as Act[];
      } finally {
        setIsGenerating(false);
        setCurrentAgent("idle");
      }
    },
    [setIsGenerating, setCurrentAgent, setOutline]
  );

  const generateScene = useCallback(
    async (
      projectConfig: ProjectConfig,
      scene: Scene,
      outline: Act[],
      previousSceneSummary: string
    ) => {
      abortRef.current = new AbortController();
      setIsGenerating(true);
      clearStreamContent();

      try {
        const res = await fetch("/api/generate-scene", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectConfig, scene, outline, previousSceneSummary }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Gagal membuat adegan");
        if (!res.body) throw new Error("Respons server kosong");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7);
              const dataLine = lines[lines.indexOf(line) + 1];
              if (dataLine?.startsWith("data: ")) {
                const data = JSON.parse(dataLine.slice(6));
                switch (eventType) {
                  case "agent-status":
                    setCurrentAgent(data.agent);
                    break;
                  case "token":
                    appendStreamContent(data.content);
                    break;
                  case "complete":
                    updateScene(scene.id, {
                      status: "complete",
                      elements: data.elements as SceneElement[],
                    });
                    break;
                  case "error":
                    updateScene(scene.id, { status: "error" });
                    throw new Error(data.message);
                }
              }
            }
          }
        }
      } finally {
        setIsGenerating(false);
        setCurrentAgent("idle");
      }
    },
    [setIsGenerating, setCurrentAgent, clearStreamContent, appendStreamContent, updateScene]
  );

  const generateFull = useCallback(
    async (projectConfig: ProjectConfig) => {
      abortRef.current = new AbortController();
      setIsGenerating(true);
      clearStreamContent();

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectConfig }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Gagal memulai pembuatan naskah");
        if (!res.body) throw new Error("Respons server kosong");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let completedCount = 0;
        let totalScenes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const eventMatch = part.match(/^event: (.+)$/m);
            const dataMatch = part.match(/^data: (.+)$/m);

            if (eventMatch && dataMatch) {
              const eventType = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              switch (eventType) {
                case "agent-status":
                  setCurrentAgent(data.agent);
                  break;
                case "outline-complete":
                  setOutline(data.outline);
                  setStatus("generating");
                  totalScenes = data.outline.reduce(
                    (sum: number, act: Act) => sum + act.scenes.length,
                    0
                  );
                  setProgress(0, totalScenes);
                  break;
                case "scene-start":
                  clearStreamContent();
                  break;
                case "token":
                  appendStreamContent(data.content);
                  break;
                case "scene-complete":
                  completedCount++;
                  setProgress(completedCount, totalScenes);
                  updateScene(data.sceneId, {
                    status: "complete",
                    elements: data.elements as SceneElement[],
                  });
                  break;
                case "complete":
                  setStatus("complete");
                  break;
                case "error":
                  throw new Error(data.message);
              }
            }
          }
        }
      } finally {
        setIsGenerating(false);
        setCurrentAgent("idle");
      }
    },
    [
      setIsGenerating,
      setCurrentAgent,
      setStatus,
      clearStreamContent,
      appendStreamContent,
      setOutline,
      setProgress,
      updateScene,
    ]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setCurrentAgent("idle");
  }, [setIsGenerating, setCurrentAgent]);

  return { generateOutline, generateScene, generateFull, abort };
}
