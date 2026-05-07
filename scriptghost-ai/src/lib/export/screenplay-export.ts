import type { Screenplay, SceneElement } from "@/lib/types/screenplay";

export function safeExportName(title: string | undefined, extension: string) {
  const base = (title || "screenplay")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return `${base || "screenplay"}.${extension}`;
}

export function serializeScreenplayText(screenplay: Screenplay) {
  const lines: string[] = [];

  lines.push(screenplay.projectConfig.title.toUpperCase());
  lines.push("");
  lines.push("Written by ScriptGhost AI");
  lines.push(`Genre: ${screenplay.projectConfig.subGenre}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const act of screenplay.acts) {
    lines.push(`ACT ${act.actNumber}: ${act.title.toUpperCase()}`);
    lines.push("");

    for (const scene of act.scenes) {
      for (const element of scene.elements) {
        lines.push(...serializeElementLines(element));
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export function serializeScreenplayFdx(screenplay: Screenplay) {
  const paragraphs = screenplay.acts
    .flatMap((act) => [
      xmlParagraph("General", `ACT ${act.actNumber}: ${act.title.toUpperCase()}`),
      ...act.scenes.flatMap((scene) =>
        scene.elements.map((element) => xmlParagraph(fdxElementType(element.type), element.content))
      ),
    ])
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
${paragraphs}
  </Content>
  <TitlePage>
    <Content>
${xmlParagraph("Title", screenplay.projectConfig.title.toUpperCase())}
${xmlParagraph("Credit", "Written by")}
${xmlParagraph("Author", "ScriptGhost AI")}
    </Content>
  </TitlePage>
</FinalDraft>`;
}

function serializeElementLines(element: SceneElement) {
  switch (element.type) {
    case "scene-heading":
      return [element.content.toUpperCase(), ""];
    case "action":
      return [element.content, ""];
    case "character-name":
      return [`        ${element.content.toUpperCase()}`];
    case "parenthetical":
      return [`      (${element.content})`];
    case "dialogue":
      return [`    ${element.content}`, ""];
    case "transition":
      return [`                                        ${element.content.toUpperCase()}`, ""];
  }
}

function fdxElementType(type: SceneElement["type"]) {
  switch (type) {
    case "scene-heading":
      return "Scene Heading";
    case "action":
      return "Action";
    case "character-name":
      return "Character";
    case "parenthetical":
      return "Parenthetical";
    case "dialogue":
      return "Dialogue";
    case "transition":
      return "Transition";
  }
}

function xmlParagraph(type: string, text: string) {
  return `    <Paragraph Type="${escapeXml(type)}"><Text>${escapeXml(text)}</Text></Paragraph>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
