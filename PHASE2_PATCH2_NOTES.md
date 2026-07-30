# Phase 2 (patch 2/4) — Prompt Builder + Context Assembler — Catatan Penerapan

Task: **P2-3, P2-4** dari `ROADMAP.md`. Melanjutkan patch Phase 2 patch 1
(domain Conversation + LLM provider) — extract SETELAH patch itu jalan.

## Yang dibangun di patch ini

1. **`core/runtime/context/`** — `ContextAssembler`: merakit `Character`
   (persona, appearance, personality) + history percakapan terbaru jadi
   satu `ConversationContext`. Ini titik yang akan diperluas di Phase 3
   untuk menarik Memory & Relationship Runtime — `PromptBuilder` tidak
   perlu berubah sama sekali saat itu terjadi.
2. **`core/runtime/prompt/`** — `PromptBuilder`: mengubah `ConversationContext`
   jadi `LlmGenerateInput` (system prompt + history + pesan terbaru) yang
   siap dikirim ke provider LLM manapun (Gemini/Claude).
3. **Implementasi Prisma yang tertinggal dari patch 1**:
   `PrismaConversationRepository`, `PrismaMessageRepository` — domain
   interface-nya sudah ada di patch 1, implementasinya baru dibuat sekarang
   karena baru dibutuhkan untuk menjalankan `ContextAssembler`.
4. **Script diagnostik** `pnpm test:prompt -- <email>` — ambil companion
   dari database, rakit context, susun prompt — TANPA memanggil LLM
   sungguhan (itu baru di patch 3, saat runtime orchestration menyatukan
   semuanya).
5. **`tsconfig.json` root** — perbaikan konfigurasi `ts-node` dari sesi
   sebelumnya, disertakan di sini supaya konsisten.

## Catatan penting soal safety yang tertanam di `PromptBuilder`

`buildSystemPrompt()` SENGAJA menyertakan 3 pagar dasar di SETIAP
percakapan (bukan opsional):
- AI disclosure — akui jujur sebagai AI kalau ditanya langsung
- Batas non-eksplisit — romantis boleh, eksplisit tidak
- Arahan saat distress — dorong cari bantuan profesional, jangan diabaikan

**Ini baseline minimum, BUKAN pengganti moderation layer sungguhan (P4-1).**
Prompt instruction bisa saja tidak dipatuhi 100% oleh model (model tidak
sempurna mengikuti instruksi), jadi validasi INPUT (appearance description,
pesan user) dan OUTPUT (balasan AI) tetap wajib dibangun terpisah di Phase 4
sebelum rilis publik — jangan anggap sistem sudah aman hanya karena
system prompt ini ada.

## Cara extract & setup

```bash
pnpm install
pnpm db:generate     # tidak ada perubahan schema di patch ini, tapi aman dijalankan ulang
```

Tidak ada migration baru di patch ini (schema tidak berubah dari patch 1).

## Cara verifikasi

```bash
pnpm test:prompt -- test@example.com
```

(ganti `test@example.com` dengan email user yang sudah punya companion
"Aya" dari verifikasi Phase 1)

Harus muncul:
1. `ConversationContext` dalam bentuk JSON — berisi data companion "Aya"
   dan `history: []` (kosong, WAJAR karena belum ada Conversation record
   sungguhan sampai patch 3)
2. System prompt lengkap dalam bentuk teks — baca isinya, pastikan
   menyebutkan nama "Aya", persona girlfriend/boyfriend, dan 3 pagar
   safety di atas
3. `✅ Context assembly & prompt building berhasil.`

Kalau errornya `User dengan email ... tidak ditemukan` atau `belum punya
companion` — pastikan email yang dipakai benar dan sudah pernah `POST
/companions` sebelumnya (dari verifikasi patch Companion & Character).

Tempel hasilnya di chat — khususnya bagian "System Prompt yang dihasilkan"
supaya saya bisa cek apakah nada/isinya sudah sesuai yang Anda inginkan
sebelum lanjut ke patch 3 (di mana ini benar-benar dikirim ke Gemini/Claude).

## Yang BELUM ada di patch ini (menyusul)
- **Patch 3**: `core/runtime/provider` (orkestrasi pilih Gemini vs Claude,
  termasuk fallback & logic "momen penting") + `core/runtime/conversation`
  (orkestrasi keseluruhan: terima pesan → context → prompt → provider →
  simpan balasan)
- **Patch 4**: Endpoint API `/conversations/:id/messages` + integration test
