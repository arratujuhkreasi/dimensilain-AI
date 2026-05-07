@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

ScriptGhost AI — full-stack Next.js 14+ app for automated horror scriptwriting using multi-agent AI pipeline.

### Tech Stack
- Next.js 14+ (App Router), Shadcn UI, Tailwind CSS v4, Zustand, Zod
- AI: Cerebras/SambaNova (OpenAI-compatible) via `@langchain/openai`
- Pipeline orchestration in `src/lib/ai/graph.ts`

### Agent Pipeline (sequential per scene)
1. Architect → structured outline (JSON)
2. Researcher → enriches with local myths
3. Dialogue Master → writes full scene
4. Format Specialist → screenplay formatting

### Key Paths
- `src/lib/ai/` — AI client, agents, prompts, pipeline graph
- `src/lib/store/` — Zustand stores (project-store, script-store)
- `src/lib/types/` — TypeScript types
- `src/components/onboarding/` — Multi-step form (8 steps)
- `src/components/screenplay/` — Screenplay viewer, typewriter effect
- `src/app/api/` — Route handlers (generate-outline, generate-scene, generate, export-pdf)

### API Routes
- `POST /api/generate-outline` — JSON response with outline
- `POST /api/generate-scene` — SSE stream for single scene
- `POST /api/generate` — SSE stream for full pipeline
- `POST /api/export-pdf` — Text file download

### Environment Variables (.env.local)
- `CEREBRAS_API_KEY` — API key for Cerebras/SambaNova
- `CEREBRAS_BASE_URL` — Base URL (OpenAI-compatible endpoint)
- `CEREBRAS_MODEL` — Model name (e.g., llama-3.1-70b)

## Design System
- Dark mode only (#0a0a0a background)
- Accent colors: `blood` (red), `amber-accent`
- Font: Geist Sans for UI, Courier Prime for screenplay
- UI language: Indonesian
