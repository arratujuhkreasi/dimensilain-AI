import { NextResponse } from "next/server";
import { projectConfigSchema } from "@/lib/validators/project-schema";
import { runOutlineOnly } from "@/lib/ai/graph";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = projectConfigSchema.safeParse(body.projectConfig);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data proyek belum valid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const acts = await runOutlineOnly(parsed.data);
    return NextResponse.json({ outline: acts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat kerangka cerita" },
      { status: 500 }
    );
  }
}
