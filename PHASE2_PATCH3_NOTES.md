# Phase 2 (patch 3/4) — Provider & Conversation Runtime Orchestration — Catatan Penerapan

Task: **P2-5, P2-6** dari `ROADMAP.md`. Melanjutkan patch Phase 2 patch 1
& 2 — extract SETELAH keduanya jalan (dan pastikan hotfix 1 & 2 sudah
diterapkan, karena `apps/api` harus bisa start bersih dulu).

## Yang dibangun di patch ini

1. **`core/runtime/provider/` — `ProviderRuntime`**: satu-satunya tempat
   yang memutuskan "pakai Gemini atau Claude". Logika saat ini:
   - Default: coba Gemini Flash dulu, kalau gagal → otomatis fallback ke Claude
   - `reason: "premium-moment"`: langsung pakai Claude (belum ada yang
     memicu ini secara otomatis — itu tugas Timeline Runtime di Phase 3)

2. **`core/runtime/conversation/` — `ConversationRuntime`**: orkestrator
   utama. Urutan: cari/buat Conversation → simpan pesan user → rakit
   context → susun prompt → panggil provider → simpan balasan companion.
   Pesan user SENGAJA disimpan SEBELUM memanggil LLM — supaya kalau kedua
   provider gagal, pesan user tidak hilang.

3. **`DomainErrorFilter`** (perbaikan gap dari Phase 1) — sebelum ini,
   error seperti `CompanionAlreadyExistsError` (harusnya HTTP 409) akan
   jatuh jadi 500 generic karena NestJS tidak tahu cara membaca properti
   custom di error kita. Sekarang terdaftar global di `main.ts`.

4. **Script `pnpm test:conversation -- <email> "<pesan>"`** — tes END-TO-END
   PENUH: benar-benar memanggil Gemini/Claude (pakai kuota API key Anda)
   dan menyimpan hasil percakapan ke database.

## Cara extract & setup

```bash
pnpm install
pnpm db:generate    # tidak ada perubahan schema, aman dijalankan ulang
```

## Cara verifikasi

**PENTING**: pastikan `pnpm dev` sudah bisa start bersih dulu (hotfix 1 & 2
sudah diterapkan) sebelum lanjut ke sini.

```bash
pnpm test:conversation -- aji@pao.test "Halo, lagi ngapain kamu?"
```

Harus muncul:
```
Mengirim pesan sebagai user ke companion "Aya"...
Pesan: "Halo, lagi ngapain kamu?"

=== Balasan Companion ===
<balasan dari Gemini Flash atau Claude>

(provider yang merespons: gemini-flash)
(conversationId: ...)

✅ Vertical slice percakapan berhasil end-to-end!
```

Coba jalankan **2-3 kali** dengan pesan berbeda — perhatikan apakah balasan
companion terasa konsisten dengan persona "Aya" (nama, gaya bicara), dan
cek di `pnpm db:studio` apakah tabel `conversations` dan `messages`
benar-benar terisi setelah ini.

## Cara sengaja memicu fallback (opsional, untuk tes reliability)

Kalau mau lihat fallback ke Claude benar-benar jalan, sementara kosongkan
`GEMINI_API_KEY` di `.env` (jadi string kosong), jalankan lagi
`pnpm test:conversation`, harusnya tetap dapat balasan tapi
`providerId: claude-sonnet` dan ada log warning "Primary LLM provider
gagal, fallback ke provider kedua". Jangan lupa isi lagi `GEMINI_API_KEY`
setelah selesai tes.

## Yang BELUM ada di patch ini (menyusul di patch 4 — TERAKHIR di Phase 2)
- Endpoint HTTP `/conversations/:id/messages` (atau serupa) di `apps/api`
  — supaya bisa dipanggil dari `apps/web`/`apps/mobile` nanti, bukan cuma
  lewat script
- Integration test otomatis (Jest) — P2-8
