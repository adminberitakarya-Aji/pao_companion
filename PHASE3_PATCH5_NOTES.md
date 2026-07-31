# Phase 3 (patch 5/6) — Sambungkan Semua ke Conversation Runtime — Catatan Penerapan

Task: **P3-5** dari `ROADMAP.md`. Ini patch PALING PENTING di Phase 3 —
Memory, Relationship, Timeline yang sebelumnya cuma bisa dites lewat
script manual, sekarang **otomatis jalan tiap kali chat sungguhan**.

## Urutan proses baru di `ConversationRuntime.handleUserMessage()`

1. Cari/buat Conversation
2. Catat milestone "percakapan pertama" kalau belum pernah (Timeline)
3. Simpan pesan user
4. **Proses Relationship SEBELUM generate balasan** — supaya kalau exchange
   ini bikin level naik, balasan companion untuk momen itu otomatis pakai
   provider premium (Claude), bukan default (Gemini)
5. Kalau level naik: catat milestone "relationship_level_up" (Timeline)
6. Rakit context (Character + **Relationship + Memory** + history)
7. Susun prompt (sekarang menyertakan level kedekatan & fakta yang diingat)
8. Panggil provider (Gemini default, atau Claude kalau premium-moment)
9. Simpan balasan companion
10. **Ekstrak & simpan Memory baru** dari exchange ini (setelah balasan
    tersedia — butuh exchange lengkap)

## Desain penting: backward compatible dengan patch sebelumnya

`ContextAssembler` dan `ConversationRuntime` menerima dependency Memory/
Relationship/Timeline sebagai **parameter opsional**. Artinya:
- `pnpm test:integration` (3 test dari Phase 2 patch 4) **tetap lolos tanpa
  perlu diubah** — cuma menjalankan versi "ringan" tanpa fitur Phase 3
- `pnpm test:prompt`, `pnpm test:conversation` (script lama) **tetap jalan**
- Endpoint HTTP sungguhan (lewat `ConversationService`) memakai versi
  LENGKAP dengan semua runtime tersambung

## File yang diubah

- `core/runtime/context/conversation-context.ts` — tambah `relationship`, `memories`
- `core/runtime/context/context-assembler.service.ts` — tarik Memory & Relationship (opsional)
- `core/runtime/prompt/prompt-builder.service.ts` — render level kedekatan & memory ke prompt
- `core/runtime/conversation/conversation-runtime.dto.ts` — tambah `relationshipLevel`, `leveledUp`
- `core/runtime/conversation/conversation-runtime.service.ts` — orkestrasi lengkap
- `apps/api/src/conversation/conversation.service.ts` — wiring lengkap semua runtime
- `scripts/test-character-extended.ts` — **diperbaiki** (crash kalau tidak di-update, karena `ConversationContext` sekarang wajib punya `relationship`/`memories`)
- `scripts/test-full-conversation.ts` — **BARU**, tes end-to-end paling lengkap

## Cara extract & setup

```bash
pnpm install
```
Tidak ada perubahan schema di patch ini (semua model sudah ada dari patch 1-4).

## Cara verifikasi

**1. Pastikan test lama masih lolos (regresi check):**
```bash
pnpm test:integration
```
Harus tetap **3 passed** seperti sebelumnya.

**2. Tes fitur baru — pakai companion yang SUDAH ADA relationship-nya**
(kalau sudah pernah jalankan `pnpm test:relationship -- aji@pao.test 30`
sebelumnya, companion "Aya" sudah py levelnya):
```bash
pnpm test:full-conversation -- aji@pao.test "Btw aku baru pulang kerja, capek banget hari ini"
```
Perhatikan:
- `(relationship level: ...)` — harus sesuai level yang sudah terkumpul
- `(level up di pesan ini: ...)` — kemungkinan "tidak" kalau levelnya jauh dari threshold berikutnya
- Bagian "Memory yang tersimpan sejauh ini" — harus mulai terisi fakta dari pesan ini dan sebelumnya

**3. Jalankan beberapa kali dengan pesan berbeda** untuk lihat level
akhirnya naik (`leveledUp: YA 🎉`) dan cek providerId berubah jadi
`claude-sonnet` di momen itu:
```bash
pnpm test:full-conversation -- aji@pao.test "Aku suka banget kalau lagi ngobrol sama kamu"
pnpm test:full-conversation -- aji@pao.test "Hari ini aku dapat kabar baik dari kantor"
```

**4. Cek `pnpm db:studio`** — tabel `memories` dan `timeline_events` harus
terus bertambah seiring Anda chat, tanpa perlu panggil script terpisah lagi.

Tempel hasil verifikasi 1 dan 2 minimal — terutama pastikan `pnpm test:integration`
masih hijau (itu tanda tidak ada regresi) — sebelum kita lanjut ke **patch
6/6 (terakhir): integration test konsistensi** yang mensimulasikan banyak
percakapan sekaligus untuk memastikan karakter tidak "amnesia".
