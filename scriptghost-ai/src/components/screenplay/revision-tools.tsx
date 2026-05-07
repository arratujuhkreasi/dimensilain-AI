"use client";

import { useState } from "react";
import { Replace, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScriptStore } from "@/lib/store/script-store";

interface RevisionToolsProps {
  idPrefix?: string;
}

export function RevisionTools({ idPrefix = "revision" }: RevisionToolsProps) {
  const { screenplay, replaceAllText, setRevisionNotes } = useScriptStore();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  if (!screenplay || screenplay.acts.length === 0) return null;

  const handleReplace = () => {
    const count = replaceAllText(findText, replaceText, caseSensitive);
    setLastCount(count);
  };
  const findInputId = `${idPrefix}-find-text`;
  const replaceInputId = `${idPrefix}-replace-text`;
  const notesInputId = `${idPrefix}-revision-notes`;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Replace className="h-4 w-4 text-blood" />
        <h3 className="text-sm font-semibold">Cari & Ganti</h3>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Mengganti nama, istilah, atau kalimat di seluruh naskah, outline, karakter, dan catatan.
      </p>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={findInputId} className="text-xs">
            Cari teks
          </Label>
          <Input
            id={findInputId}
            value={findText}
            onChange={(event) => setFindText(event.target.value)}
            placeholder="Nama lama atau kalimat"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={replaceInputId} className="text-xs">
            Ganti dengan
          </Label>
          <Input
            id={replaceInputId}
            value={replaceText}
            onChange={(event) => setReplaceText(event.target.value)}
            placeholder="Nama baru atau revisi"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(event) => setCaseSensitive(event.target.checked)}
            className="size-3.5 rounded border-border accent-red-600"
          />
          Cocokkan huruf besar/kecil
        </label>

        <Button
          size="sm"
          onClick={handleReplace}
          disabled={!findText.trim()}
          className="w-full bg-blood hover:bg-blood/90 text-blood-foreground"
        >
          <Replace className="h-3.5 w-3.5 mr-1" />
          Ganti Semua
        </Button>

        {lastCount !== null && (
          <p className="text-xs text-muted-foreground">
            {lastCount} kemunculan diganti.
          </p>
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-accent" />
          <Label htmlFor={notesInputId} className="text-sm font-semibold">
            Catatan Revisi
          </Label>
        </div>
        <Textarea
          id={notesInputId}
          value={screenplay.revisionNotes || ""}
          onChange={(event) => setRevisionNotes(event.target.value)}
          placeholder="Contoh: dialog Raka dibuat lebih natural, ending jangan terlalu eksplisit..."
          className="min-h-28 text-sm"
        />
      </div>
    </div>
  );
}
