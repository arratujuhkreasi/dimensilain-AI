"use client";

import type { Scene, SceneElement } from "@/lib/types/screenplay";
import { Textarea } from "@/components/ui/textarea";

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
  isEditing?: boolean;
  onElementChange?: (elementIndex: number, content: string) => void;
}

function editableClassName(type: SceneElement["type"]) {
  switch (type) {
    case "scene-heading":
      return "font-bold uppercase tracking-wide";
    case "character-name":
      return "text-center font-bold uppercase";
    case "parenthetical":
      return "text-center italic";
    case "dialogue":
      return "mx-auto max-w-[70%] text-center";
    case "transition":
      return "text-right font-bold uppercase";
    default:
      return "";
  }
}

export function SceneBlock({ scene, isEditing = false, onElementChange }: SceneBlockProps) {
  if (scene.elements.length === 0) {
    return (
      <div className="py-4 text-muted-foreground text-sm italic">
        Scene {scene.sceneNumber}: {scene.summary}
      </div>
    );
  }

  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      {scene.elements.map((element, index) =>
        isEditing ? (
          <Textarea
            key={index}
            value={element.content}
            onChange={(event) => onElementChange?.(index, event.target.value)}
            className={`mb-3 min-h-10 resize-y border-border/70 bg-background/80 font-screenplay text-sm ${editableClassName(
              element.type
            )}`}
          />
        ) : (
          <ElementRenderer key={index} element={element} />
        )
      )}
    </div>
  );
}
