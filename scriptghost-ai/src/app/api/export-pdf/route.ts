import { NextResponse } from "next/server";
import type { Screenplay } from "@/lib/types/screenplay";
import { safeExportName } from "@/lib/export/screenplay-export";
import { createScreenplayPdfBuffer } from "@/lib/export/screenplay-pdf";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const screenplay = body.screenplay as Screenplay;

    if (!screenplay || !screenplay.acts.length) {
      return NextResponse.json({ error: "No screenplay data provided" }, { status: 400 });
    }

    const buffer = await createScreenplayPdfBuffer(screenplay);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeExportName(
          screenplay.projectConfig.title,
          "pdf"
        )}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
