"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Clapperboard,
  ClipboardCheck,
  FileClock,
  Film,
  ListChecks,
  MessageSquare,
  Mic2,
  SearchCheck,
  Sparkles,
  StickyNote,
  Users,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RevisionTools } from "@/components/screenplay/revision-tools";
import { useScriptStore } from "@/lib/store/script-store";
import type { Scene, SceneElement, SceneRevisionStatus } from "@/lib/types/screenplay";

type WorkMode = "read" | "direct" | "edit";

interface ProductionWorkspaceProps {
  mode: WorkMode;
  onModeChange: (mode: WorkMode) => void;
  idPrefix?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  reviewed: "Reviewed",
  "needs-revision": "Needs Revision",
  approved: "Approved",
};

export function ProductionWorkspace({
  mode,
  onModeChange,
  idPrefix = "production",
}: ProductionWorkspaceProps) {
  const {
    screenplay,
    updateCharacterProfile,
    updateScene,
    updateSceneElement,
    setSceneRevisionStatus,
    addSceneComment,
    setSceneProductionNote,
    setSceneShotIntent,
    setSceneRewriteNote,
    applyRewriteNote,
    setProductionNotes,
    saveVersion,
    restoreVersion,
  } = useScriptStore();
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [versionLabel, setVersionLabel] = useState("");

  const scenes = useMemo(
    () => screenplay?.acts.flatMap((act) => act.scenes.map((scene) => ({ ...scene, act }))) || [],
    [screenplay]
  );

  const continuityIssues = useMemo(() => {
    if (!screenplay) return [];

    const issues: string[] = [];
    const fullText = screenplay.acts
      .flatMap((act) => act.scenes.flatMap((scene) => scene.elements.map((element) => element.content)))
      .join("\n")
      .toLowerCase();
    const uniqueLocations = new Set(
      screenplay.acts.flatMap((act) =>
        act.scenes.map((scene) => scene.heading.split("-")[0]?.replace(/^int\.|^ext\./i, "").trim())
      )
    );
    const headings = new Set<string>();

    screenplay.projectConfig.characters.forEach((character) => {
      if (character.name && !fullText.includes(character.name.toLowerCase())) {
        issues.push(`${character.name} belum muncul di body naskah.`);
      }
    });

    scenes.forEach(({ heading, summary, sceneNumber }) => {
      if (!heading.trim()) issues.push(`Scene ${sceneNumber} belum punya heading.`);
      if (!summary.trim()) issues.push(`Scene ${sceneNumber} belum punya summary.`);
      if (headings.has(heading)) issues.push(`Heading berulang: ${heading}.`);
      headings.add(heading);
    });

    if (uniqueLocations.size > screenplay.projectConfig.constraints.maxLocations) {
      issues.push(
        `Jumlah lokasi terdeteksi ${uniqueLocations.size}, melebihi batas ${screenplay.projectConfig.constraints.maxLocations}.`
      );
    }

    if (screenplay.projectConfig.characters.length > screenplay.projectConfig.constraints.maxActors) {
      issues.push(
        `Jumlah karakter ${screenplay.projectConfig.characters.length}, melebihi batas aktor ${screenplay.projectConfig.constraints.maxActors}.`
      );
    }

    return issues;
  }, [screenplay, scenes]);

  if (!screenplay || screenplay.acts.length === 0) return null;

  const dialogueLines = scenes.flatMap(({ id, heading, elements }) =>
    elements
      .map((element, elementIndex) => ({ sceneId: id, heading, element, elementIndex }))
      .filter((item) => item.element.type === "character-name" || item.element.type === "dialogue")
  );

  return (
    <div className="space-y-4">
      <ToolSection
        icon={<Workflow />}
        title="Mode Kerja"
        description="Memilih cara layar dipakai: reading bersih, directing dengan catatan, atau edit teks langsung."
      >
        <div className="grid grid-cols-3 gap-2">
          {(["read", "direct", "edit"] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={mode === item ? "secondary" : "outline"}
              onClick={() => onModeChange(item)}
              className="capitalize"
            >
              {item}
            </Button>
          ))}
        </div>
      </ToolSection>

      <Tabs defaultValue={getToolsetForMode(mode)} key={mode} className="space-y-3">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="write" className="text-xs">Writing</TabsTrigger>
          <TabsTrigger value="direct" className="text-xs">Directing</TabsTrigger>
          <TabsTrigger value="lock" className="text-xs">Lock</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ToolSection
            icon={<ListChecks />}
            title="Roadmap Tahap 1-3"
            description="Urutan kerja lengkap dari draft naskah sampai siap dibaca, disutradarai, dan dikunci produksi."
          >
            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-blood pl-3">
                <p className="font-semibold">Tahap 1: Writing & Revision</p>
                <p className="text-muted-foreground">
                  Pakai Cari & Ganti, edit langsung, character bible, dan auto rewrite note.
                </p>
              </div>
              <div className="border-l-2 border-amber-accent pl-3">
                <p className="font-semibold">Tahap 2: Reading & Directing</p>
                <p className="text-muted-foreground">
                  Pakai Reading Cast View, Director Notes, Dialogue Pass, dan Shot Intent untuk table read.
                </p>
              </div>
              <div className="border-l-2 border-foreground/30 pl-3">
                <p className="font-semibold">Tahap 3: Production Lock</p>
                <p className="text-muted-foreground">
                  Pakai Revision Status, Scene Cards, Continuity Checker, Production Notes, dan Version History.
                </p>
              </div>
            </div>
          </ToolSection>

          <ToolSection
            icon={<BookOpen />}
            title="Cara Pakai Mode"
            description="Ringkasan singkat fungsi tiap mode agar tidak terasa sama saat dipilih."
          >
            <div className="space-y-3 text-xs">
              <p><span className="font-semibold text-foreground">Reading:</span> baca naskah bersih seperti script final.</p>
              <p><span className="font-semibold text-foreground">Directing:</span> lihat lapisan kerja sutradara per scene, termasuk note, shot intent, dan status.</p>
              <p><span className="font-semibold text-foreground">Editing:</span> ubah isi scene langsung per elemen tanpa masuk tool lain.</p>
            </div>
          </ToolSection>
        </TabsContent>

        <TabsContent value="write" className="space-y-4">
          <RevisionTools idPrefix={`${idPrefix}-replace`} />

          <ToolSection
            icon={<Users />}
            title="Character Bible"
            description="Menyimpan identitas, kelemahan, dan cara pandang karakter agar konsisten sepanjang naskah."
          >
            <div className="space-y-3">
              {screenplay.projectConfig.characters.map((character) => (
                <div key={character.id} className="space-y-2 rounded-lg border border-border/70 p-3">
                  <Input
                    value={character.name}
                    onChange={(event) => updateCharacterProfile(character.id, { name: event.target.value })}
                    className="font-semibold"
                  />
                  <Textarea
                    value={character.physicalDescription}
                    onChange={(event) =>
                      updateCharacterProfile(character.id, { physicalDescription: event.target.value })
                    }
                    className="min-h-16 text-xs"
                  />
                  <Textarea
                    value={character.weakness}
                    onChange={(event) => updateCharacterProfile(character.id, { weakness: event.target.value })}
                    className="min-h-16 text-xs"
                  />
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection
            icon={<Sparkles />}
            title="Auto Rewrite by Note"
            description="Menerapkan arahan revisi ke scene sebagai draft rewrite cepat sebelum writer merapikan detailnya."
          >
            <div className="space-y-2">
              {scenes.map(({ id, heading, rewriteNote }) => (
                <div key={id} className="space-y-2 rounded-md border border-border/70 p-2">
                  <Label className="line-clamp-1 text-xs">{heading}</Label>
                  <Textarea
                    value={rewriteNote || ""}
                    onChange={(event) => setSceneRewriteNote(id, event.target.value)}
                    placeholder="Contoh: buat dialog lebih dingin dan teror lebih lambat"
                    className="min-h-16 text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={() => applyRewriteNote(id)}>
                    Terapkan Draft Rewrite
                  </Button>
                </div>
              ))}
            </div>
          </ToolSection>
        </TabsContent>

        <TabsContent value="direct" className="space-y-4">
          <ToolSection
            icon={<MessageSquare />}
            title="Director Notes"
            description="Memberi feedback per scene tanpa harus mengubah teks naskah secara langsung."
          >
            <div className="space-y-3">
              {scenes.map(({ id, act, sceneNumber, heading, comments }) => (
                <div key={id} className="space-y-2 rounded-lg border border-border/70 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-blood">
                        Act {act.actNumber} / Scene {sceneNumber}
                      </p>
                      <p className="text-xs text-foreground">{heading}</p>
                    </div>
                    <Badge variant="outline">{comments?.length || 0}</Badge>
                  </div>
                  {(comments || []).map((comment) => (
                    <p key={comment.id} className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{comment.author}: </span>
                      {comment.body}
                    </p>
                  ))}
                  <Textarea
                    value={commentDrafts[id] || ""}
                    onChange={(event) =>
                      setCommentDrafts((drafts) => ({ ...drafts, [id]: event.target.value }))
                    }
                    placeholder="Catatan director untuk scene ini"
                    className="min-h-16 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      addSceneComment(id, commentDrafts[id] || "");
                      setCommentDrafts((drafts) => ({ ...drafts, [id]: "" }));
                    }}
                  >
                    Tambah Note
                  </Button>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection
            icon={<Mic2 />}
            title="Dialogue Pass"
            description="Memeriksa dan mengedit hanya bagian dialog serta nama karakter tanpa terganggu action line."
          >
            <div className="space-y-2">
              {dialogueLines.map(({ sceneId, heading, element, elementIndex }, index) => (
                <div key={`${sceneId}-${elementIndex}-${index}`} className="space-y-1 rounded-md border border-border/70 p-2">
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">{heading}</p>
                  <Textarea
                    value={element.content}
                    onChange={(event) => updateSceneElement(sceneId, elementIndex, event.target.value)}
                    className={`min-h-10 text-xs ${element.type === "character-name" ? "font-bold uppercase" : ""}`}
                  />
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection
            icon={<BookOpen />}
            title="Reading Cast View"
            description="Menampilkan dialog berdasarkan karakter agar table read dan pembagian talent lebih mudah."
          >
            {screenplay.projectConfig.characters.map((character) => {
              const lines = collectCharacterDialogue(screenplay.acts.flatMap((act) => act.scenes), character.name);
              return (
                <div key={character.id} className="mb-3 rounded-lg border border-border/70 p-3">
                  <p className="text-xs font-semibold text-blood">{character.name}</p>
                  {lines.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belum ada dialog terdeteksi.</p>
                  ) : (
                    lines.map((line, index) => (
                      <p key={`${character.id}-${index}`} className="mt-2 text-xs leading-relaxed">
                        {line}
                      </p>
                    ))
                  )}
                </div>
              );
            })}
          </ToolSection>

          <ToolSection
            icon={<Film />}
            title="Shot Intent / Mood Layer"
            description="Mencatat rasa visual scene seperti tension, blocking, silence, dan energi kamera untuk director."
          >
            <div className="space-y-2">
              {scenes.map(({ id, heading, shotIntent }) => (
                <div key={id} className="space-y-1">
                  <Label className="line-clamp-1 text-xs">{heading}</Label>
                  <Textarea
                    value={shotIntent || ""}
                    onChange={(event) => setSceneShotIntent(id, event.target.value)}
                    placeholder="Contoh: slow push-in, tahan sunyi 4 detik sebelum suara pintu"
                    className="min-h-16 text-xs"
                  />
                </div>
              ))}
            </div>
          </ToolSection>
        </TabsContent>

        <TabsContent value="lock" className="space-y-4">
          <ToolSection
            icon={<ClipboardCheck />}
            title="Revision Status"
            description="Menandai scene mana yang masih draft, perlu revisi, sudah direview, atau sudah approved."
          >
            <div className="space-y-2">
              {scenes.map(({ id, sceneNumber, heading, revisionStatus }) => (
                <div key={id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-border/70 p-2">
                  <div>
                    <p className="text-xs font-medium">Scene {sceneNumber}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{heading}</p>
                  </div>
                  <select
                    value={revisionStatus || "draft"}
                    onChange={(event) =>
                      setSceneRevisionStatus(id, event.target.value as SceneRevisionStatus)
                    }
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection
            icon={<Clapperboard />}
            title="Scene Cards / Beat Board"
            description="Melihat struktur cerita sebagai kartu ringkas agar ritme act, konflik, dan fungsi scene cepat terbaca."
          >
            <div className="space-y-2">
              {scenes.map(({ id, sceneNumber, heading, summary, revisionStatus }) => (
                <div key={id} className="rounded-lg border border-border/70 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-blood">Scene {sceneNumber}</p>
                    <Badge variant={revisionStatus === "approved" ? "secondary" : "outline"}>
                      {STATUS_LABELS[revisionStatus || "draft"]}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium">{heading}</p>
                  <Textarea
                    value={summary}
                    onChange={(event) => updateScene(id, { summary: event.target.value })}
                    className="mt-2 min-h-20 text-xs"
                  />
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection
            icon={<SearchCheck />}
            title="Continuity Checker"
            description="Mendeteksi masalah konsistensi dasar seperti karakter tidak muncul, lokasi melebihi batas, atau scene kosong."
          >
            {continuityIssues.length === 0 ? (
              <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                Tidak ada masalah continuity dasar yang terdeteksi.
              </p>
            ) : (
              <div className="space-y-2">
                {continuityIssues.map((issue) => (
                  <p key={issue} className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs">
                    {issue}
                  </p>
                ))}
              </div>
            )}
          </ToolSection>

          <ToolSection
            icon={<StickyNote />}
            title="Production Notes"
            description="Mencatat kebutuhan produksi seperti lokasi, properti, biaya, blocking, dan batasan syuting."
          >
            <Textarea
              value={screenplay.productionNotes || ""}
              onChange={(event) => setProductionNotes(event.target.value)}
              placeholder="Catatan produksi global"
              className="mb-3 min-h-24 text-xs"
            />
            <div className="space-y-2">
              {scenes.map(({ id, heading, productionNote }) => (
                <div key={id} className="space-y-1">
                  <Label className="line-clamp-1 text-xs">{heading}</Label>
                  <Textarea
                    value={productionNote || ""}
                    onChange={(event) => setSceneProductionNote(id, event.target.value)}
                    placeholder="Catatan produksi untuk scene ini"
                    className="min-h-16 text-xs"
                  />
                </div>
              ))}
            </div>
          </ToolSection>

          <ToolSection
            icon={<FileClock />}
            title="Version History"
            description="Menyimpan snapshot draft sehingga tim bisa kembali ke versi lama saat revisi terlalu jauh."
          >
            <div className="flex gap-2">
              <Input
                value={versionLabel}
                onChange={(event) => setVersionLabel(event.target.value)}
                placeholder="Nama versi"
              />
              <Button
                size="sm"
                onClick={() => {
                  saveVersion(versionLabel);
                  setVersionLabel("");
                }}
              >
                Simpan
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {(screenplay.versions || []).map((version) => (
                <div key={version.id} className="flex items-center justify-between gap-2 rounded-md border border-border/70 p-2">
                  <div>
                    <p className="text-xs font-medium">{version.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(version.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => restoreVersion(version.id)}>
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </ToolSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getToolsetForMode(mode: WorkMode) {
  if (mode === "edit") return "write";
  if (mode === "direct") return "direct";
  return "overview";
}

function ToolSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="text-blood [&_svg]:size-4">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}

function collectCharacterDialogue(scenes: Scene[], characterName: string) {
  const lines: string[] = [];
  const normalized = characterName.trim().toLowerCase();

  scenes.forEach((scene) => {
    scene.elements.forEach((element, index) => {
      if (element.type !== "character-name" || element.content.trim().toLowerCase() !== normalized) {
        return;
      }

      const dialogue = scene.elements
        .slice(index + 1)
        .find((nextElement) => nextElement.type === "dialogue") as SceneElement | undefined;

      if (dialogue) lines.push(dialogue.content);
    });
  });

  return lines;
}
