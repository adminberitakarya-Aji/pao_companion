# Phase 2 (patch 1/4) — Domain Conversation + LLM Provider — Catatan Penerapan

Task: **P2-1, P2-2** dari `ROADMAP.md`. Melanjutkan patch Phase 1
(auth + companion/character) — extract SETELAH kedua patch sebelumnya jalan.

## Yang dibangun di patch ini

1. **`core/domain/conversation/`** — `Conversation` (pembungkus tipis/thread)
   dan `Message` (entity independen, PUNYA repository sendiri, bukan bagian
   aggregate Conversation) — supaya history panjang tidak perlu di-load
   sekaligus ke memory.
2. **`core/infrastructure/providers/llm/`** — interface `LlmProvider` +
   2 adapter asli:
   - `GeminiFlashProvider` (primary) — panggil REST API Gemini langsung (fetch)
   - `ClaudeSonnetProvider` (fallback/premium) — panggil REST API Anthropic langsung (fetch)
   - `LlmProviderFactory` — cuma bikin instance, BELUM ada logic "kapan pakai yang mana" (itu di patch 3, `core/runtime/provider`)
3. **Prisma schema** — tambah `Conversation`, `Message`, enum `MessageRole`
4. **Script diagnostik** `scripts/test-llm-providers.ts` — buat cek API key
   valid SEBELUM disambungkan ke runtime lengkap

## Cara extract & setup

```bash
# extract ZIP menimpa folder pao-companion yang sudah ada
pnpm install
pnpm db:generate
pnpm db:migrate       # nama migration: add_conversation_message
```

Isi `.env` dengan API key yang sudah kita putuskan:
```
GEMINI_API_KEY="isi-api-key-Anda"
GEMINI_MODEL="gemini-2.5-flash"
ANTHROPIC_API_KEY="isi-api-key-Anda"
ANTHROPIC_MODEL="claude-sonnet-4-5"
```

**Catatan model**: nama model (`gemini-2.5-flash`, `claude-sonnet-4-5`) saya
set sebagai default yang masuk akal, tapi SELALU cek dokumentasi resmi
masing-masing provider untuk nama model yang aktif saat Anda deploy —
penamaan model berubah dari waktu ke waktu.

## Cara verifikasi (sebelum lanjut ke patch 2)

```bash
pnpm test:llm
```

Harus muncul:
```
--- Testing Gemini Flash ---
Response: <balasan dari Gemini>
✅ Gemini Flash OK

--- Testing Claude Sonnet ---
Response: <balasan dari Claude>
✅ Claude Sonnet OK
```

Kalau salah satu `❌ FAILED`, baca pesan error-nya — biasanya karena:
- API key belum diisi / salah
- API key tidak punya akses ke model yang di-set di `GEMINI_MODEL`/`ANTHROPIC_MODEL`
- Nama model sudah tidak tersedia lagi (coba model lain sesuai dokumentasi terbaru provider)

Tempel pesan errornya di chat kalau ada yang gagal, saya bantu diagnosa.

## Yang BELUM ada di patch ini (menyusul)

- **Patch 2**: Prompt builder (`core/runtime/prompt`) + Context assembler (`core/runtime/context`) — ini yang menyusun system prompt dari `Character` (persona, appearance, personality) + history percakapan
- **Patch 3**: `core/runtime/provider` (orkestrasi pilih Gemini vs Claude — termasuk logic fallback & "momen penting") + `core/runtime/conversation` (orkestrasi keseluruhan flow)
- **Patch 4**: Endpoint API `/conversations/:id/messages` + integration test

Belum ada endpoint HTTP untuk chat di patch ini — itu di patch 4, setelah
semua runtime di patch 2 & 3 selesai. `pnpm test:llm` adalah satu-satunya
cara verifikasi di tahap ini.
