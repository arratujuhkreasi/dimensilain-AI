"use client";

import { useEffect, useRef } from "react";
import { useScriptStore } from "@/lib/store/script-store";
import { useGenerationStream } from "@/hooks/use-generation-stream";
import { ScreenplayViewer } from "@/components/screenplay/screenplay-viewer";
import { GenerationPanel } from "@/components/generation/generation-panel";
import { Button } from "@/components/ui/button";
import { Ghost, Download, Play, Square } from "lucide-react";
import Link from "next/link";

export default function ScriptPage() {
  const { screenplay, isGenerating } = useScriptStore();
  const { generateFull, abort } = useGenerationStream();
  const didAutoStart = useRef(false);

  const handleGenerate = () => {
    if (screenplay?.projectConfig) {
      generateFull(screenplay.projectConfig);
    }
  };

  useEffect(() => {
    if (!screenplay || screenplay.acts.length > 0 || isGenerating || didAutoStart.current) {
      return;
    }

    didAutoStart.current = true;
    generateFull(screenplay.projectConfig);
  }, [generateFull, isGenerating, screenplay]);

  const handleExport = async (format: "pdf" | "fdx") => {
    if (!screenplay) return;

    const res = await fetch(format === "pdf" ? "/api/export-pdf" : "/api/export-fdx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screenplay }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${screenplay.projectConfig.title || "screenplay"}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!screenplay) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Ghost className="h-10 w-10 text-blood" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Naskah belum tersedia</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Mulai dari onboarding untuk membuat proyek baru, atau lanjutkan proyek yang tersimpan
            di browser ini.
          </p>
        </div>
        <Link href="/project/new">
          <Button className="bg-blood hover:bg-blood/90 text-blood-foreground">
            Mulai Proyek Baru
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Ghost className="h-5 w-5 text-blood" />
          <span className="font-semibold text-sm">ScriptGhost AI</span>
        </Link>

        <div className="flex items-center gap-2">
          {isGenerating ? (
            <Button variant="destructive" size="sm" onClick={abort}>
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={!screenplay.projectConfig}
                className="bg-blood hover:bg-blood/90 text-blood-foreground"
              >
                <Play className="h-3 w-3 mr-1" />
                Generate
              </Button>
              {screenplay && screenplay.acts.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport("fdx")}>
                    <Download className="h-3 w-3 mr-1" />
                    FDX
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="w-80 border-r border-border p-4 space-y-4 hidden lg:block">
          <GenerationPanel />

          {screenplay && screenplay.acts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Outline</h3>
              {screenplay.acts.map((act) => (
                <div key={act.actNumber} className="space-y-1">
                  <p className="text-xs font-medium text-blood">
                    Act {act.actNumber}: {act.title}
                  </p>
                  {act.scenes.map((scene) => (
                    <p
                      key={scene.id}
                      className={`text-xs pl-3 ${
                        scene.status === "complete"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {scene.sceneNumber}. {scene.heading}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </aside>

        <div className="flex-1 p-6 overflow-auto">
          <ScreenplayViewer />
        </div>
      </div>
    </main>
  );
}
