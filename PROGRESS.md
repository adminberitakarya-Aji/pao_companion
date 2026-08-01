# PAO Companion — Progress

Update tiap task selesai. Checklist ini = source of truth status project.
Referensi detail tiap task ID ada di `ROADMAP.md`.
Status : ⬜ Belum mulai / 🟡 Berjalan / ✅ Selesai

## Phase 0 — Bootstrap
- [x] P0-1 Root config
- [x] P0-2 Lint/Prettier shared
- [x] P0-3 apps/api skeleton
- [x] P0-4 apps/web skeleton
- [x] P0-5 Prisma + DB
- [x] P0-6 CI pipeline
- [x] P0-7 .env.example
**Status Phase 0**: ✅ Selesai

## Phase 1 — Core Domain
- [x] P1-1 Schema User/Companion/Character
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
- [x] P2-7 API endpoint chat
- [x] P2-8 Integration test
**Status Phase 2**: ✅ Selesai

## Phase 3 — Companion Engine
- [x] P3-1 Memory
- [x] P3-2 Relationship
- [x] P3-3 Timeline
- [x] P3-4 Character diperluas
- [x] P3-5 Context/prompt update
- [x] P3-6 Integration test konsistensi
**Status Phase 3**: ✅ Selesai

## Phase 4 — Safety & Trust
- [x] P4-1 Content moderation
- [x] P4-2 AI disclosure
- [x] P4-3 Verifikasi usia
- [x] P4-4 Deteksi distress/crisis
- [x] P4-5 Data retention
**Status Phase 4**: ✅ Selesai

## Phase 5 — Media Engine
- [ ] P5-1 Domain MediaAsset
- [ ] P5-2 Provider adapter image (Fal.ai/Flux)
- [ ] P5-3 Provider adapter voice (ElevenLabs)
- [ ] P5-4 Provider adapter video (HeyGen/D-ID)
- [ ] P5-5 Moderasi multimodal (perluasan P4-1)
- [ ] P5-6 Media runtime orchestration + preview/review gate
- [ ] P5-7 Storage integration
- [ ] P5-8 Script diagnostik + laporan biaya aktual
**Status Phase 5**: ⬜/🟡/✅

## Phase 6 — Web
- [ ] P6-1 Auth pages (+ dateOfBirth, AI disclosure onboarding)
- [ ] P6-2 Chat page
- [ ] P6-3 Companion dashboard
- [ ] P6-4 Tampilan avatar/voice/video companion
- [ ] P6-5 packages/ui
**Status Phase 6**: ⬜/🟡/✅

## Phase 7 — Billing
- [ ] P7-1 Domain wallet/credit/subscription/transaction
- [ ] P7-2 Payment gateway sandbox
- [ ] P7-3 Credit deduction atomik
- [ ] P7-4 Webhook idempotent
- [ ] P7-5 Kalibrasi paket kredit media dari data Phase 5
- [ ] P7-6 Billing page di web
**Status Phase 7**: ⬜/🟡/✅

## Phase 8 — Mobile
- [ ] P8-1 Expo skeleton
- [ ] P8-2 Reuse packages
- [ ] P8-3 Auth + chat + media mobile
- [ ] P8-4 Billing page mobile
- [ ] P8-5 EAS build preview
**Status Phase 8**: ⬜/🟡/✅
