import { projectConfigSchema } from "@/lib/validators/project-schema";
import { parseFormattedScene, runScenePipeline } from "@/lib/ai/graph";
import type { Scene, Act } from "@/lib/types/screenplay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = projectConfigSchema.safeParse(body.projectConfig);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Data proyek belum valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const scene = body.scene as Scene;
    const outline = body.outline as Act[];
    const previousSceneSummary = (body.previousSceneSummary as string) || "";

    if (!scene || !outline) {
      return new Response(JSON.stringify({ error: "Adegan atau kerangka cerita belum tersedia" }), {
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

        try {
          const pipeline = runScenePipeline(
            parsed.data,
            scene,
            outline,
            previousSceneSummary
          );

          for await (const event of pipeline) {
            if (event.type === "agent") {
              sendEvent("agent-status", { agent: event.data });
            } else if (event.type === "token") {
              sendEvent("token", { content: event.data });
            } else if (event.type === "complete") {
              sendEvent("complete", {
                sceneId: scene.id,
                content: event.data,
                elements: parseFormattedScene(event.data),
              });
            }
          }
        } catch (error) {
          sendEvent("error", {
            message: error instanceof Error ? error.message : "Gagal membuat adegan",
          });
        }

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
      JSON.stringify({ error: error instanceof Error ? error.message : "Terjadi masalah di server" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
