"use client";

import type { Scene, SceneElement } from "@/lib/types/screenplay";

function ElementRenderer({ element }: { element: SceneElement }) {
  switch (element.type) {
    case "scene-heading":
      return (
        <p className="font-bold uppercase tracking-wide mt-6 mb-2">{element.content}</p>
      );
    case "action":
      return <p className="mb-2">{element.content}</p>;
    case "character-name":
      return (
        <p className="uppercase text-center font-bold mt-4 mb-0">{element.content}</p>
      );
    case "parenthetical":
      return <p className="text-center text-muted-foreground italic mb-0">({element.content})</p>;
    case "dialogue":
      return <p className="text-center max-w-[60%] mx-auto mb-2">{element.content}</p>;
    case "transition":
      return <p className="text-right uppercase font-bold mt-4 mb-2">{element.content}</p>;
    default:
      return <p>{element.content}</p>;
  }
}

interface SceneBlockProps {
  scene: Scene;
}

export function SceneBlock({ scene }: SceneBlockProps) {
  if (scene.elements.length === 0) {
    return (
      <div className="py-4 text-muted-foreground text-sm italic">
        Scene {scene.sceneNumber}: {scene.summary}
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      {scene.elements.map((element, i) => (
        <ElementRenderer key={i} element={element} />
      ))}
    </div>
  );
}
