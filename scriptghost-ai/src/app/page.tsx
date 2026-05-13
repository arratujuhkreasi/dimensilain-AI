import Link from "next/link";
import { Ghost, Clapperboard, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Ghost className="h-12 w-12 text-blood" />
          <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            DIMENSI LAIN SCRIPT PRODUCTION
          </h1>
        </div>

        <p className="text-lg text-muted-foreground">
          Buat draft naskah horor dari ide singkat untuk tim produksi{" "}
          <span className="text-amber-accent font-semibold">Dimensi Lain</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
            <Clapperboard className="h-6 w-6 text-blood" />
            <span>Alur AI Bertahap</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
            <Sparkles className="h-6 w-6 text-amber-accent" />
            <span>Naskah 15-90 Menit</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
            <FileText className="h-6 w-6 text-blood" />
            <span>Format Naskah Film</span>
          </div>
        </div>

        <Link href="/project/new">
          <Button size="lg" className="bg-blood hover:bg-blood/90 text-blood-foreground mt-4">
            Mulai Naskah Baru
          </Button>
        </Link>
      </div>
    </main>
  );
}
