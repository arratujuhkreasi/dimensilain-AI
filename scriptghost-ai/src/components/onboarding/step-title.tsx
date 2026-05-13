"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function StepTitle() {
  const { config, setTitle, setLogline, setSetting } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ide Cerita</h2>
        <p className="text-muted-foreground mt-1">
          Cukup isi inti cerita. Detail kecil bisa menyusul nanti.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Judul Film</Label>
          <Input
            id="title"
            placeholder="Contoh: Rumah Terakhir"
            value={config.title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logline">Inti Cerita</Label>
          <Textarea
            id="logline"
            placeholder="Ringkasan 1-2 kalimat. Contoh: Sekelompok mahasiswa terjebak di rumah tua yang menyimpan rahasia ritual lama..."
            value={config.logline}
            onChange={(e) => setLogline(e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setting">Lokasi Utama</Label>
          <Input
            id="setting"
            placeholder="Contoh: Rumah tua di pinggir hutan"
            value={config.setting}
            onChange={(e) => setSetting(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
