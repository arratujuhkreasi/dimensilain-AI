import { getLlm } from "../cerebras-client";
import { formatPrompt } from "../prompts/format-prompt";

export async function runFormatSpecialist(rawScene: string): Promise<string> {
  const chain = formatPrompt.pipe(getLlm());

  const result = await chain.invoke({ rawScene });

  return typeof result.content === "string" ? result.content : "";
}

export async function* streamFormatSpecialist(rawScene: string): AsyncGenerator<string> {
  const chain = formatPrompt.pipe(getLlm());

  const stream = await chain.stream({ rawScene });

  for await (const chunk of stream) {
    const content = typeof chunk.content === "string" ? chunk.content : "";
    if (content) yield content;
  }
}
