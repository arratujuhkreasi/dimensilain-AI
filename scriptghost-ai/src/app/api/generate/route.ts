import { projectConfigSchema } from "@/lib/validators/project-schema";
import { runFullPipeline } from "@/lib/ai/graph";
import type { SceneElement } from "@/lib/types/screenplay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = projectConfigSchema.safeParse(body.projectConfig);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid project config" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        await runFullPipeline(parsed.data, {
          onAgentChange: (agent) => sendEvent("agent-status", { agent }),
          onSceneStart: (actNumber, sceneNumber) =>
            sendEvent("scene-start", { actNumber, sceneNumber }),
          onToken: (content) => sendEvent("token", { content }),
          onSceneComplete: (sceneId, elements: SceneElement[]) =>
            sendEvent("scene-complete", { sceneId, elements }),
          onOutlineComplete: (outline) => sendEvent("outline-complete", { outline }),
          onComplete: () => sendEvent("complete", {}),
          onError: (message) => sendEvent("error", { message }),
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
