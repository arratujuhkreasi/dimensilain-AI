"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function StepSetting() {
  const { config, setSetting, setSettingDetails } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Setting & Lokasi</h2>
        <p className="text-muted-foreground mt-1">
          Lokasi utama cerita - sesuaikan dengan aset yang dimiliki
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="setting">Lokasi Utama</Label>
          <Input
            id="setting"
            placeholder="Contoh: Rumah tua di pinggir hutan, Desa terpencil di Jawa Tengah"
            value={config.setting}
            onChange={(e) => setSetting(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settingDetails">Detail Tambahan</Label>
          <Textarea
            id="settingDetails"
            placeholder="Deskripsikan suasana, waktu, dan elemen visual yang diinginkan..."
            value={config.settingDetails}
            onChange={(e) => setSettingDetails(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
