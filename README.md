# PAO Companion

Platform AI companion — provider-independent, dengan runtime engine terpisah
untuk character, relationship, timeline, conversation, memory, context, prompt,
dan media.

## Status
Phase 0 — Bootstrap. Struktur repo & tooling siap, business logic belum diisi.
Lihat `ROADMAP.md` dan `PROGRESS.md` untuk status pengerjaan.

## Quick start

```bash
pnpm install
cp .env.example .env   # isi DATABASE_URL, JWT_SECRET, dll
pnpm db:generate
pnpm db:migrate
pnpm dev
```

- API: http://localhost:3000/health
- Web: http://localhost:3001 (Next.js default port akan menyesuaikan)

## Struktur

```
apps/           web, api (mobile menyusul Phase 7)
core/           domain, application, runtime, infrastructure, shared
packages/       ui, types, config — kode shared antar apps
docs/           dokumentasi arsitektur & spesifikasi (00-09)
tests/          unit, integration, e2e
infrastructure/ docker, terraform, deployment config
_future/        rencana migrasi microservices (Phase 9, belum dikerjakan)
```

## Dokumentasi penting
- `docs/00-foundation/` — vision, philosophy, principles
- `docs/03-ai-architecture/` — provider layer, prompt system, memory system
- `docs/09-safety-and-trust/` — content policy, age verification, crisis handling
- `ROADMAP.md` — roadmap step-by-step per Phase
- `PROGRESS.md` — checklist tracker progress pengerjaan
