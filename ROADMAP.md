# PAO COMPANION — Roadmap Pengerjaan & Sistem Monitoring

Asumsi: tim kecil/solo developer, mengikuti struktur repo v2, prioritas vertical slice
(bukan membangun semua runtime sekaligus). Setiap Phase punya Definition of Done (DoD)
yang jelas supaya progress bisa diverifikasi objektif, bukan "rasanya sudah jalan".

Cara pakai roadmap ini untuk monitoring:
- Setiap task punya ID unik (P0-1, P1-3, dst) — dipakai di commit message & PR title
  → `git commit -m "P1-3: implement User domain entity"`
- Salin bagian "PROGRESS TRACKER" di bagian bawah ke file `PROGRESS.md` di root repo,
  checklist di-update tiap task selesai. Ini jadi single source of truth status project.
- Setiap Phase berakhir dengan checklist DoD — Phase berikutnya baru boleh mulai kalau
  DoD Phase sebelumnya checklist-nya 100%.

---

## PHASE 0 — Bootstrap & Tooling (target: 2-4 hari)

Tujuan: repo bisa `pnpm install && pnpm dev` tanpa error, sebelum satu baris business logic pun ditulis.

| ID | Task | Output |
|---|---|---|
| P0-1 | Init repo, `package.json` root, `pnpm-workspace.yaml`, `turbo.json` | Root config jalan |
| P0-2 | Setup `tsconfig.base.json`, ESLint, Prettier shared di `packages/config` | Lint jalan di semua workspace |
| P0-3 | Setup `apps/api` skeleton (NestJS kosong, `/health` endpoint) | `curl localhost:3000/health` → 200 |
| P0-4 | Setup `apps/web` skeleton (Next.js kosong, landing placeholder) | `pnpm dev` web jalan di browser |
| P0-5 | Setup Prisma di `core/infrastructure/database`, provision Postgres (Supabase/Prisma Postgres) | `npx prisma studio` konek ke DB kosong |
| P0-6 | `.github/workflows/ci.yml` — jalankan lint + build + test di setiap push | CI hijau di push pertama |
| P0-7 | `.env.example` lengkap semua variable yang akan dipakai (DB, AI provider keys, JWT secret) | File ada, tidak ada secret asli ter-commit |

**DoD Phase 0**: `pnpm install`, `pnpm build`, `pnpm dev` semua jalan tanpa error di clone fresh. CI pipeline hijau.

---

## PHASE 1 — Core Domain Foundation (target: 1 minggu)

Tujuan: domain model inti + auth, tanpa AI sama sekali dulu. Ini fondasi yang dipakai semua fitur di atasnya.

| ID | Task | Output |
|---|---|---|
| P1-1 | Schema Prisma: `User`, `Companion`, `Character` (dasar, belum lengkap) | Migration jalan |
| P1-2 | `core/domain/user/` — entity, value object, repository interface | Unit test domain lolos |
| P1-3 | `core/domain/companion/` — entity dasar (nama, karakter terkait, owner) | Unit test domain lolos |
| P1-4 | Auth flow: register/login/JWT di `apps/api` + `core/application/use-cases/auth` | Bisa register & login via Postman/curl |
| P1-5 | `core/shared/errors`, `core/shared/logger`, `core/shared/validation` (zod/class-validator) | Dipakai konsisten di semua use-case berikutnya |
| P1-6 | Middleware auth guard di `apps/api` | Endpoint terproteksi return 401 tanpa token |

**DoD Phase 1**: User bisa register, login, dapat JWT, akses endpoint terproteksi. Domain `User` & `Companion` punya unit test.

---

## PHASE 2 — Vertical Slice: Percakapan End-to-End (target: 1-2 minggu)

Tujuan: **satu jalur penuh** user kirim pesan → AI balas → tersimpan. Ini validasi paling penting sebelum lanjut fitur lain — kalau ini tidak solid, semua runtime lain percuma dibangun duluan.

| ID | Task | Output |
|---|---|---|
| P2-1 | `core/domain/conversation/` — entity Message, Conversation | Unit test lolos |
| P2-2 | `core/infrastructure/providers/llm/` — adapter 1 provider AI saja dulu (mis. Claude atau OpenAI) | Bisa call API, dapat respons |
| P2-3 | `core/runtime/prompt/` — prompt builder sederhana (system prompt + history, belum ada memory/relationship) | Prompt ter-generate dari 1 karakter dummy |
| P2-4 | `core/runtime/context/` — assembler yang gabungkan character + history jadi context untuk prompt | Context object lengkap |
| P2-5 | `core/runtime/provider/` — orkestrasi pilih provider + call + parse response | Response terstruktur balik dari runtime/prompt |
| P2-6 | `core/runtime/conversation/` — orkestrasi keseluruhan flow (terima pesan → context → prompt → provider → simpan) | Endpoint `/conversations/:id/messages` POST bekerja |
| P2-7 | Endpoint API + response ke `apps/api` | Bisa chat via Postman, dapat balasan AI, tersimpan di DB |
| P2-8 | Integration test end-to-end flow ini | Test hijau di CI |

**DoD Phase 2**: Dari Postman/curl, user kirim pesan ke satu companion dummy, dapat balasan AI yang tersimpan di DB dan bisa diambil lagi sebagai history. Ini adalah MVP inti produk.

---

## PHASE 3 — Companion Engine Lengkap (target: 2-3 minggu)

Tujuan: tambahkan yang bikin companion "hidup" — memory, relationship progression, timeline. Baru dikerjakan setelah Phase 2 solid.

| ID | Task | Output |
|---|---|---|
| P3-1 | `core/domain/memory/` + `core/runtime/memory/` — simpan & retrieve fakta penting dari percakapan | Memory ter-inject ke context di percakapan berikutnya |
| P3-2 | `core/domain/relationship/` + `core/runtime/relationship/` — skor/level kedekatan, progresi hubungan | Relationship level berubah seiring interaksi |
| P3-3 | `core/domain/timeline/` + `core/runtime/timeline/` — event/milestone dalam hubungan | Timeline entry tercatat otomatis dari event tertentu |
| P3-4 | `core/domain/character/` diperluas — personality traits, speech style, backstory | Karakter custom bisa dibuat, bukan cuma dummy |
| P3-5 | Update `core/runtime/context` & `prompt` untuk gabungkan memory + relationship + timeline ke prompt | Balasan AI konsisten dengan history relationship |
| P3-6 | Integration test: simulasi 10+ percakapan berturut, cek konsistensi karakter | Test hijau, tidak ada "amnesia" karakter |

**DoD Phase 3**: Companion mengingat fakta dari percakapan sebelumnya, level hubungan berubah, dan gaya bicara konsisten sesuai karakter — bisa dites manual dengan sesi chat panjang.

---

## PHASE 4 — Safety & Trust (target: 1 minggu, PARALEL dengan Phase 3)

Tujuan: implementasi kebijakan dari `docs/09-safety-and-trust/` jadi kode nyata — bukan cuma dokumen. **Wajib selesai sebelum Phase 6 (rilis publik).**

| ID | Task | Output |
|---|---|---|
| P4-1 | Content moderation layer di `core/runtime/conversation` — filter/flag konten sebelum simpan & sebelum ditampilkan | Test kasus konten bermasalah ter-flag |
| P4-2 | AI disclosure — pesan sistem wajib yang menegaskan companion adalah AI (di onboarding & berkala) | Muncul di UI onboarding |
| P4-3 | Verifikasi usia saat registrasi | Registrasi under-age ditolak/dibatasi |
| P4-4 | Deteksi kata kunci distress/crisis dalam percakapan → respons aman + arahan bantuan | Test kasus simulasi trigger respons yang benar |
| P4-5 | Data retention policy diimplementasi (auto-delete/anonymize sesuai `data-privacy.md`) | Job scheduled berjalan |

**DoD Phase 4**: Semua 5 kebijakan safety punya implementasi teknis yang teruji, bukan sekadar dokumen markdown.

---

## PHASE 5 — Billing & Monetization (target: 1-2 minggu)

| ID | Task | Output |
|---|---|---|
| P5-1 | `core/domain/wallet`, `credit`, `subscription`, `transaction` | Unit test lolos |
| P5-2 | Integrasi payment gateway (Midtrans, konsisten dengan Klip-AI) | Sandbox transaction sukses |
| P5-3 | Credit deduction pakai `prisma.$transaction` + `updateMany` guard (pelajaran dari race condition Klip-AI) | Test concurrent request tidak double-deduct |
| P5-4 | Webhook handler payment, idempotent | Test replay webhook tidak duplikat transaksi |

**DoD Phase 5**: Transaksi kredit/subscription sandbox berhasil, teruji tidak ada race condition (replikasi test yang sama seperti audit Klip-AI sebelumnya).

---

## PHASE 6 — Frontend Web (target: 2-3 minggu, bisa mulai paralel setelah Phase 2 DoD tercapai)

| ID | Task | Output |
|---|---|---|
| P6-1 | `apps/web` — halaman auth (login/register) | Bisa login dari UI |
| P6-2 | Halaman chat/companion utama | Bisa chat dari UI, hasil sama dengan Postman test |
| P6-3 | Dashboard karakter (buat/edit companion) | CRUD companion dari UI |
| P6-4 | Halaman billing/wallet | Top-up & lihat saldo dari UI |
| P6-5 | `packages/ui` — komponen shared (button, card, chat bubble, dll) | Dipakai konsisten di semua halaman |

**DoD Phase 6**: User baru bisa daftar → buat companion → chat → top-up kredit, semua dari browser tanpa Postman.

---

## PHASE 7 — Mobile App (target: 2-3 minggu, setelah Phase 6 stabil)

| ID | Task | Output |
|---|---|---|
| P7-1 | `apps/mobile` skeleton (Expo) | Build jalan di simulator |
| P7-2 | Reuse `packages/ui` & `packages/types` semaksimal mungkin | Minim duplikasi kode dengan web |
| P7-3 | Auth + chat flow mobile | Fitur inti parity dengan web |
| P7-4 | EAS build Android preview (pola yang sudah pernah sukses di project Klip Anda) | APK bisa di-install & dites |

**DoD Phase 7**: APK preview bisa dipakai untuk chat end-to-end di device Android nyata.

---

## PHASE 8 — Media Engine (target: 2 minggu, opsional/bisa mundur)

| ID | Task | Output |
|---|---|---|
| P8-1 | `core/infrastructure/providers/{voice,image,video}` | Adapter provider siap |
| P8-2 | `core/runtime/media` — orkestrasi generate voice note/image dari companion | Companion bisa kirim voice/image balasan |
| P8-3 | Storage integration (`core/infrastructure/storage`) | Media tersimpan & bisa diakses via CDN/signed URL |

**DoD Phase 8**: Companion bisa membalas dengan voice note atau image, tersimpan dan bisa diputar/ditampilkan di UI.

---

## PHASE 9 — Scaling & Microservices Migration (FUTURE — hanya jika load menuntut)

Jangan dikerjakan kecuali ada bukti konkret (metrik load, biaya infra, atau tim bertambah besar) yang menunjukkan modular monolith sudah jadi bottleneck. Kalau saatnya tiba: pisahkan `core/runtime/conversation` jadi `_future/services/companion-service` duluan (paling I/O-heavy), baru service lain menyusul satu-satu.

---

## PROGRESS TRACKER (copy ke `PROGRESS.md` di root repo)

```markdown
# PAO Companion — Progress

Update tiap task selesai. Checklist ini = source of truth status project.

## Phase 0 — Bootstrap
- [ ] P0-1 Root config
- [ ] P0-2 Lint/Prettier shared
- [ ] P0-3 apps/api skeleton
- [ ] P0-4 apps/web skeleton
- [ ] P0-5 Prisma + DB
- [ ] P0-6 CI pipeline
- [ ] P0-7 .env.example
**Status Phase 0**: ⬜ Belum mulai / 🟡 Berjalan / ✅ Selesai

## Phase 1 — Core Domain
- [ ] P1-1 Schema User/Companion/Character
- [ ] P1-2 Domain User
- [ ] P1-3 Domain Companion
- [ ] P1-4 Auth flow
- [ ] P1-5 Shared errors/logger/validation
- [ ] P1-6 Auth guard
**Status Phase 1**: ⬜/🟡/✅

## Phase 2 — Vertical Slice Percakapan
- [ ] P2-1 Domain Conversation
- [ ] P2-2 Provider adapter LLM
- [ ] P2-3 Prompt builder
- [ ] P2-4 Context assembler
- [ ] P2-5 Provider runtime orchestration
- [ ] P2-6 Conversation runtime orchestration
- [ ] P2-7 API endpoint chat
- [ ] P2-8 Integration test
**Status Phase 2**: ⬜/🟡/✅

## Phase 3 — Companion Engine
- [ ] P3-1 Memory
- [ ] P3-2 Relationship
- [ ] P3-3 Timeline
- [ ] P3-4 Character diperluas
- [ ] P3-5 Context/prompt update
- [ ] P3-6 Integration test konsistensi
**Status Phase 3**: ⬜/🟡/✅

## Phase 4 — Safety & Trust
- [ ] P4-1 Content moderation
- [ ] P4-2 AI disclosure
- [ ] P4-3 Verifikasi usia
- [ ] P4-4 Deteksi distress/crisis
- [ ] P4-5 Data retention
**Status Phase 4**: ⬜/🟡/✅

## Phase 5 — Billing
- [ ] P5-1 Domain wallet/credit/subscription/transaction
- [ ] P5-2 Payment gateway sandbox
- [ ] P5-3 Credit deduction atomik
- [ ] P5-4 Webhook idempotent
**Status Phase 5**: ⬜/🟡/✅

## Phase 6 — Web
- [ ] P6-1 Auth pages
- [ ] P6-2 Chat page
- [ ] P6-3 Companion dashboard
- [ ] P6-4 Billing page
- [ ] P6-5 packages/ui
**Status Phase 6**: ⬜/🟡/✅

## Phase 7 — Mobile
- [ ] P7-1 Expo skeleton
- [ ] P7-2 Reuse packages
- [ ] P7-3 Auth + chat mobile
- [ ] P7-4 EAS build preview
**Status Phase 7**: ⬜/🟡/✅

## Phase 8 — Media Engine
- [ ] P8-1 Provider adapter voice/image/video
- [ ] P8-2 Media runtime
- [ ] P8-3 Storage integration
**Status Phase 8**: ⬜/🟡/✅
```

---

## Aturan monitoring tambahan
1. **Satu PR = satu ID task** (atau grup kecil ID terkait) — jangan gabung banyak Phase dalam satu PR besar, supaya history jelas kapan sesuatu selesai.
2. **CI harus hijau sebelum merge** — jangan biarkan lint/test merah menumpuk.
3. **DoD Phase adalah gate, bukan saran** — kalau ada godaan mulai Phase 3 sebelum Phase 2 DoD tercapai (mis. "sekalian aja tambah memory sekarang"), tahan dulu. Ini pola yang sebelumnya bikin Suro & Buya punya banyak dokumen tapi kode inti kosong.
4. Review `PROGRESS.md` tiap akhir minggu — kalau satu Phase macet >1 minggu dari estimasi, itu sinyal untuk break down task-nya lebih kecil lagi, bukan dipaksa lanjut.
