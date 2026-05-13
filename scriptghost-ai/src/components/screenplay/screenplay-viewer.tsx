"use client";

import { Badge } from "@/components/ui/badge";
import { useScriptStore } from "@/lib/store/script-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SceneBlock } from "./scene-block";
import { TypewriterText } from "./typewriter-text";

interface ScreenplayViewerProps {
  mode?: "read" | "direct" | "edit";
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  reviewed: "Sudah Dicek",
  "needs-revision": "Perlu Revisi",
  approved: "Disetujui",
};

export function ScreenplayViewer({ mode = "read" }: ScreenplayViewerProps) {
  const { screenplay, streamingContent, isGenerating, updateSceneElement } = useScriptStore();
  const isEditing = mode === "edit";
  const isDirecting = mode === "direct";

  if (!screenplay) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Belum ada naskah yang di-generate.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="max-w-[700px] mx-auto p-8 bg-card rounded-lg border border-border font-screenplay text-sm leading-relaxed">
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold uppercase tracking-widest">
            {screenplay.projectConfig.title}
          </h1>
          <p className="text-muted-foreground text-xs mt-2">
            Dibuat oleh DIMENSI LAIN SCRIPT PRODUCTION
          </p>
        </div>

        {mode === "read" && (
          <div className="mb-6 rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            Mode Baca menampilkan naskah bersih seperti versi final.
          </div>
        )}

        {mode === "direct" && (
          <div className="mb-6 rounded-md border border-blood/30 bg-blood/5 px-4 py-3 text-xs text-foreground">
            Mode Sutradara menampilkan catatan kerja per adegan: status revisi, catatan sutradara, dan arahan gambar.
          </div>
        )}

        {mode === "edit" && (
          <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-foreground">
            Mode Edit membuka isi naskah agar bisa diubah langsung per bagian.
          </div>
        )}

        {screenplay.acts.map((act) => (
          <div key={act.actNumber} className="mb-8">
            <h2 className="text-center font-bold uppercase text-blood mb-4">
              BABAK {act.actNumber}: {act.title}
            </h2>
            {act.scenes.map((scene) => (
              <div key={scene.id} className="mb-6 border-b border-border/50 pb-6 last:mb-0 last:border-0 last:pb-0">
                {isDirecting && (
                  <div className="mb-4 rounded-lg border border-border/70 bg-muted/40 p-4 font-sans">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant={scene.revisionStatus === "approved" ? "secondary" : "outline"}>
                        {STATUS_LABELS[scene.revisionStatus || "draft"]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Adegan {scene.sceneNumber}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <InfoRow
                        label="Ringkasan Adegan"
                        value={scene.summary}
                        emptyText="Belum ada ringkasan scene."
                      />
                      <InfoRow
                        label="Catatan Sutradara"
                        value={joinBodies(scene.comments?.map((comment) => comment.body))}
                        emptyText="Belum ada catatan sutradara."
                      />
                      <InfoRow
                        label="Arahan Gambar"
                        value={scene.shotIntent}
                        emptyText="Belum ada arahan gambar atau suasana."
                      />
                      <InfoRow
                        label="Catatan Produksi"
                        value={scene.productionNote}
                        emptyText="Belum ada catatan produksi."
                      />
                    </div>
                  </div>
                )}

                <SceneBlock
                  scene={scene}
                  isEditing={isEditing}
                  onElementChange={(elementIndex, content) =>
                    updateSceneElement(scene.id, elementIndex, content)
                  }
                />
              </div>
            ))}
          </div>
        ))}

        {isGenerating && streamingContent && (
          <div className="mt-4 pt-4 border-t border-border">
            <TypewriterText content={streamingContent} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function InfoRow({
  label,
  value,
  emptyText,
}: {
  label: string;
  value?: string;
  emptyText: string;
}) {
  return (
    <div>
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{value?.trim() || emptyText}</p>
    </div>
  );
}

function joinBodies(values?: string[]) {
  return values?.filter((value) => value.trim()).join(" | ");
}
