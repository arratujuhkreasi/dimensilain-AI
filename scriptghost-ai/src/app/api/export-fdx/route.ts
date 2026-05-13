import { NextResponse } from "next/server";
import type { Screenplay } from "@/lib/types/screenplay";
import { safeExportName, serializeScreenplayFdx } from "@/lib/export/screenplay-export";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const screenplay = body.screenplay as Screenplay;

    if (!screenplay || !screenplay.acts.length) {
      return NextResponse.json({ error: "Data naskah belum tersedia" }, { status: 400 });
    }

    return new Response(serializeScreenplayFdx(screenplay), {
      headers: {
        "Content-Type": "application/vnd.finaldraft.fdx+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeExportName(
          screenplay.projectConfig.title,
          "fdx"
        )}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengekspor naskah" },
      { status: 500 }
    );
  }
}
