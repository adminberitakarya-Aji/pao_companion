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

## PHASE 5 — Media Engine (target: 2-3 minggu)

> Diletakkan SEBELUM Web & Billing (bukan urutan awal) — ini bagian paling
> berisiko (provider pihak ketiga baru, kualitas avatar photorealistic
> belum teruji, biaya per-generate belum jelas). Divalidasi dulu lewat
> script CLI (pola sama seperti `test:conversation`, `test:memory`, dst),
> BUKAN lewat UI Web yang belum ada. Fase ini murni internal testing —
> BELUM ada enforcement biaya/billing (itu di Phase 7); tujuannya cuma
> mengumpulkan data biaya & kualitas nyata untuk kalibrasi billing nanti.

Persona companion tetap WAJIB fiksi/AI-generated — bukan kloning wajah
atau suara orang nyata yang bisa diidentifikasi tanpa consent eksplisit.

| ID | Task | Output |
|---|---|---|
| P5-1 | `core/domain/media` — entity `MediaAsset` (type: avatar_image \| voice_clip \| talking_head_video, status PENDING/GENERATING/READY/FAILED, provider, costEstimate) | Unit test lolos |
| P5-2 | `core/infrastructure/providers/image` — adapter Fal.ai (model Flux) untuk avatar image | Generate 1 foto companion photorealistic dari deskripsi Character |
| P5-3 | `core/infrastructure/providers/voice` — adapter ElevenLabs | Generate voice clip dari teks balasan companion |
| P5-4 | `core/infrastructure/providers/video` — adapter HeyGen/D-ID (talking-head, lip-sync dari 1 foto + audio) | Generate video companion "bicara" dari hasil P5-2 + P5-3 |
| P5-5 | Moderasi output multimodal — perluasan `ContentModerator` (P4-1) untuk gambar/video, BUKAN cuma teks | Foto/video yang lolos guideline provider tetap dicek lapisan sendiri sebelum disimpan/ditampilkan |
| P5-6 | `core/runtime/media` — Media Runtime: orkestrasi generate image → voice → video → moderasi → simpan, mirror pola preview/review gate (cek voice match, lip-sync, kewajaran state) | Companion bisa hasilkan paket foto+suara+video dari 1 pemanggilan |
| P5-7 | Storage integration (`core/infrastructure/storage`) | Media tersimpan & bisa diakses via CDN/signed URL |
| P5-8 | Script diagnostik `scripts/test-media-engine.ts` — jalankan generate end-to-end, log biaya aktual & waktu proses tiap provider per panggilan | Laporan cost/kualitas nyata untuk keputusan lanjut/ganti provider |

**DoD Phase 5**: Lewat script (bukan UI), companion bisa menghasilkan foto
avatar photorealistic + voice clip + video talking-head, semua tersimpan
& bisa diputar/ditampilkan, sudah melalui moderasi multimodal. Ada
laporan biaya aktual per generate (image/voice/video) sebagai dasar
desain paket kredit di Phase 7 — TANPA billing enforcement apa pun di
fase ini.

---

## PHASE 6 — Frontend Web (target: 2-3 minggu, bisa mulai paralel setelah Phase 2 DoD tercapai)

| ID | Task | Output |
|---|---|---|
| P6-1 | `apps/web` — halaman auth (login/register, termasuk field tanggal lahir P4-3 & layar AI disclosure onboarding P4-2) | Bisa login dari UI |
| P6-2 | Halaman chat/companion utama | Bisa chat dari UI, hasil sama dengan Postman test |
| P6-3 | Dashboard karakter (buat/edit companion) | CRUD companion dari UI |
| P6-4 | Tampilan avatar/voice/video companion (hasil Phase 5) di UI chat | Foto/video companion tampil, bukan cuma teks |
| P6-5 | `packages/ui` — komponen shared (button, card, chat bubble, media player, dll) | Dipakai konsisten di semua halaman |

**DoD Phase 6**: User baru bisa daftar → ack AI disclosure → buat companion
→ chat (dengan avatar/media kalau sudah di-generate di Phase 5) — semua
dari browser tanpa Postman. Halaman billing/wallet BELUM ada di fase ini
(nunggu Phase 7).

---

## PHASE 7 — Billing & Monetization (target: 1-2 minggu)

| ID | Task | Output |
|---|---|---|
| P7-1 | `core/domain/wallet`, `credit`, `subscription`, `transaction` | Unit test lolos |
| P7-2 | Integrasi payment gateway (Midtrans, konsisten dengan Klip-AI) | Sandbox transaction sukses |
| P7-3 | Credit deduction pakai `prisma.$transaction` + `updateMany` guard (pelajaran dari race condition Klip-AI) | Test concurrent request tidak double-deduct |
| P7-4 | Webhook handler payment, idempotent | Test replay webhook tidak duplikat transaksi |
| P7-5 | Kalibrasi paket kredit media (image/voice/video) berdasarkan data biaya aktual dari P5-8 | Harga paket kredit UMKM Indonesia yang masuk akal & menutup biaya provider |
| P7-6 | Halaman billing/wallet di `apps/web` (`P6-4` versi lama, dipindah ke sini) | Top-up & lihat saldo dari UI |

**DoD Phase 7**: Transaksi kredit/subscription sandbox berhasil, teruji
tidak ada race condition (replikasi test yang sama seperti audit Klip-AI
sebelumnya), dan paket kredit media sudah dikalibrasi dari data biaya
nyata Phase 5 — bukan tebakan.

---

## PHASE 8 — Mobile App (target: 2-3 minggu, setelah Phase 6 & 7 stabil)

| ID | Task | Output |
|---|---|---|
| P8-1 | `apps/mobile` skeleton (Expo) | Build jalan di simulator |
| P8-2 | Reuse `packages/ui` & `packages/types` semaksimal mungkin | Minim duplikasi kode dengan web |
| P8-3 | Auth + chat + media (foto/video companion) flow mobile | Fitur inti parity dengan web |
| P8-4 | Halaman billing mobile | Top-up & lihat saldo dari app |
| P8-5 | EAS build Android preview (pola yang sudah pernah sukses di project Klip Anda) | APK bisa di-install & dites |

**DoD Phase 8**: APK preview bisa dipakai untuk chat + lihat media
companion + top-up kredit end-to-end di device Android nyata.

---

## PHASE 9 — Scaling & Microservices Migration (FUTURE — hanya jika load menuntut)

Jangan dikerjakan kecuali ada bukti konkret (metrik load, biaya infra, atau tim bertambah besar) yang menunjukkan modular monolith sudah jadi bottleneck. Kalau saatnya tiba: pisahkan `core/runtime/conversation` jadi `_future/services/companion-service` duluan (paling I/O-heavy), baru service lain menyusul satu-satu. 

## Aturan monitoring tambahan
1. **Satu PR = satu ID task** (atau grup kecil ID terkait) — jangan gabung banyak Phase dalam satu PR besar, supaya history jelas kapan sesuatu selesai.
2. **CI harus hijau sebelum merge** — jangan biarkan lint/test merah menumpuk.
3. **DoD Phase adalah gate, bukan saran** — kalau ada godaan mulai Phase 3 sebelum Phase 2 DoD tercapai (mis. "sekalian aja tambah memory sekarang"), tahan dulu. Ini pola yang sebelumnya bikin Suro & Buya punya banyak dokumen tapi kode inti kosong.
4. Review `PROGRESS.md` tiap akhir minggu — kalau satu Phase macet >1 minggu dari estimasi, itu sinyal untuk break down task-nya lebih kecil lagi, bukan dipaksa lanjut. 