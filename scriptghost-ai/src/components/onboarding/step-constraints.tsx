"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function StepConstraints() {
  const { config, setConstraints } = useProjectStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Batasan Produksi</h2>
        <p className="text-muted-foreground mt-1">
          Agar naskah realistis untuk diproduksi tanpa biaya berlebih
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxLocations">Maksimal Lokasi</Label>
            <Input
              id="maxLocations"
              type="number"
              min={1}
              max={20}
              value={config.constraints.maxLocations}
              onChange={(e) => setConstraints({ maxLocations: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxActors">Maksimal Aktor</Label>
            <Input
              id="maxActors"
              type="number"
              min={1}
              max={30}
              value={config.constraints.maxActors}
              onChange={(e) => setConstraints({ maxActors: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Catatan Tambahan</Label>
          <Textarea
            id="notes"
            placeholder="Contoh: Hanya bisa syuting malam hari, ada properti boneka antik..."
            value={config.constraints.additionalNotes}
            onChange={(e) => setConstraints({ additionalNotes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
