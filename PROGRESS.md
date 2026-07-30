# PAO Companion — Progress

Update tiap task selesai. Checklist ini = source of truth status project.
Referensi detail tiap task ID ada di `ROADMAP.md`.

## Phase 0 — Bootstrap
- [x] P0-1 Root config (package.json, pnpm-workspace.yaml, turbo.json)
- [x] P0-2 tsconfig.base.json + packages/config (eslint/prettier preset)
- [x] P0-3 apps/api skeleton (NestJS, /health)
- [x] P0-4 apps/web skeleton (Next.js)
- [x] P0-5 Prisma schema dasar (core/infrastructure/database)
- [x] P0-6 CI pipeline (.github/workflows/ci.yml)
- [x] P0-7 .env.example
**Status Phase 0**: ✅ Berjalan — generated, belum `pnpm install` & belum di-push ke GitHub

> Catatan: task di atas checklist "generated" oleh Claude, tapi Phase 0 baru
> benar-benar DoD-complete setelah kamu jalankan `pnpm install && pnpm dev`
> dan CI hijau di push pertama ke repo. Update jadi ✅ setelah itu terverifikasi.

## Phase 1 — Core Domain
- [x] P1-1 Schema User/Companion/Character (lengkap)
- [x] P1-2 Domain User
- [x] P1-3 Domain Companion
- [x] P1-4 Auth flow
- [x] P1-5 Shared errors/logger/validation
- [x] P1-6 Auth guard
**Status Phase 1**: ✅ Selesai

## Phase 2 — Vertical Slice Percakapan
- [x] P2-1 Domain Conversation
- [x] P2-2 Provider adapter LLM
- [x] P2-3 Prompt builder
- [x] P2-4 Context assembler
- [x] P2-5 Provider runtime orchestration
- [x] P2-6 Conversation runtime orchestration
- [ ] P2-7 API endpoint chat
- [ ] P2-8 Integration test
**Status Phase 2**: ⬜ Belum mulai

## Phase 3 — Companion Engine
- [ ] P3-1 Memory
- [ ] P3-2 Relationship
- [ ] P3-3 Timeline
- [ ] P3-4 Character diperluas
- [ ] P3-5 Context/prompt update
- [ ] P3-6 Integration test konsistensi
**Status Phase 3**: ⬜ Belum mulai

## Phase 4 — Safety & Trust
- [ ] P4-1 Content moderation
- [ ] P4-2 AI disclosure
- [ ] P4-3 Verifikasi usia
- [ ] P4-4 Deteksi distress/crisis
- [ ] P4-5 Data retention
**Status Phase 4**: ⬜ Belum mulai

## Phase 5 — Billing
- [ ] P5-1 Domain wallet/credit/subscription/transaction
- [ ] P5-2 Payment gateway sandbox
- [ ] P5-3 Credit deduction atomik
- [ ] P5-4 Webhook idempotent
**Status Phase 5**: ⬜ Belum mulai

## Phase 6 — Web
- [ ] P6-1 Auth pages
- [ ] P6-2 Chat page
- [ ] P6-3 Companion dashboard
- [ ] P6-4 Billing page
- [ ] P6-5 packages/ui
**Status Phase 6**: ⬜ Belum mulai

## Phase 7 — Mobile
- [ ] P7-1 Expo skeleton
- [ ] P7-2 Reuse packages
- [ ] P7-3 Auth + chat mobile
- [ ] P7-4 EAS build preview
**Status Phase 7**: ⬜ Belum mulai

## Phase 8 — Media Engine
- [ ] P8-1 Provider adapter voice/image/video
- [ ] P8-2 Media runtime
- [ ] P8-3 Storage integration
**Status Phase 8**: ⬜ Belum mulai
