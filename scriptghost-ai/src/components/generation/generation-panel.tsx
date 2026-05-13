"use client";

import { useScriptStore } from "@/lib/store/script-store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Search, MessageSquare, FileText, CheckCircle } from "lucide-react";

const AGENT_INFO: Record<string, { label: string; icon: React.ReactNode }> = {
  architect: { label: "Perancang cerita - membuat struktur", icon: <Brain className="h-4 w-4" /> },
  researcher: { label: "Periset - mencari bahan cerita", icon: <Search className="h-4 w-4" /> },
  dialogue: { label: "Penulis dialog - membuat percakapan", icon: <MessageSquare className="h-4 w-4" /> },
  format: { label: "Perapih format - menyusun naskah", icon: <FileText className="h-4 w-4" /> },
  idle: { label: "Menunggu", icon: <CheckCircle className="h-4 w-4" /> },
};

export function GenerationPanel() {
  const { currentAgent, isGenerating, generationProgress } = useScriptStore();
  const agentInfo = AGENT_INFO[currentAgent] || AGENT_INFO.idle;
  const progressPercent =
    generationProgress.total > 0
      ? (generationProgress.completed / generationProgress.total) * 100
      : 0;

  if (!isGenerating && generationProgress.total === 0) return null;

  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-3">
      <div className="flex items-center gap-2">
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin text-blood" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        <span className="text-sm font-medium">
          {isGenerating ? "Sedang membuat naskah..." : "Selesai"}
        </span>
      </div>

      {isGenerating && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {agentInfo.icon}
            {agentInfo.label}
          </Badge>
        </div>
      )}

      {generationProgress.total > 0 && (
        <div className="space-y-1">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {generationProgress.completed} / {generationProgress.total} adegan
          </p>
        </div>
      )}
    </div>
  );
}
