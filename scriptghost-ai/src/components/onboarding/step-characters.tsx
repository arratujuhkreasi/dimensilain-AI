"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { CharacterRole } from "@/lib/types/project";

const ROLE_LABELS: Record<CharacterRole, string> = {
  protagonist: "Protagonis",
  antagonist: "Antagonis",
  supporting: "Pendukung",
  victim: "Korban",
};

export function StepCharacters() {
  const { config, addCharacter, updateCharacter, removeCharacter } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Karakter</h2>
        <p className="text-muted-foreground mt-1">
          Isi nama peran dan kriteria talent yang penting untuk casting.
        </p>
      </div>

      <div className="space-y-4">
        {config.characters.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-5 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Belum ada karakter. Mulai dari tokoh utama dulu.
            </p>
            <Button variant="outline" onClick={addCharacter}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Karakter Utama
            </Button>
          </div>
        )}

        {config.characters.map((char) => (
          <div key={char.id} className="p-4 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <Select
                value={char.role}
                onValueChange={(v) => updateCharacter(char.id, { role: v as CharacterRole })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Hapus karakter ${char.name || "tanpa nama"}`}
                onClick={() => removeCharacter(char.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Nama Karakter</Label>
                <Input
                  placeholder="Nama karakter"
                  value={char.name}
                  onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rentang Usia</Label>
                <Input
                  placeholder="Contoh: 20-25 tahun"
                  value={char.ageRange ?? ""}
                  onChange={(e) => updateCharacter(char.id, { ageRange: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Kriteria Talent</Label>
                <Input
                  placeholder="Contoh: ekspresif, bisa terlihat rapuh tapi tegas"
                  value={char.talentCriteria ?? ""}
                  onChange={(e) => updateCharacter(char.id, { talentCriteria: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fisik / Ciri Visual</Label>
                <Input
                  placeholder="Contoh: kurus, mata lelah, rambut pendek"
                  value={char.physicalDescription ?? ""}
                  onChange={(e) =>
                    updateCharacter(char.id, { physicalDescription: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Konflik / Ketakutan</Label>
                <Input
                  placeholder="Contoh: takut gelap, trauma kehilangan adik"
                  value={char.weakness ?? ""}
                  onChange={(e) => updateCharacter(char.id, { weakness: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Skill / Aksi Khusus</Label>
                <Input
                  placeholder="Contoh: berlari, stunt ringan, menangis intens"
                  value={char.specialSkills ?? ""}
                  onChange={(e) => updateCharacter(char.id, { specialSkills: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}

        {config.characters.length > 0 && (
          <Button variant="outline" onClick={addCharacter} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karakter
          </Button>
        )}
      </div>
    </div>
  );
}
