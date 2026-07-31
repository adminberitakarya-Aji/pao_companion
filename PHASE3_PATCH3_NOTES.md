# Phase 3 (patch 3/6) — Timeline — Catatan Penerapan

Task: **P3-3** dari `ROADMAP.md`. Extract setelah patch 1 (Memory) dan
patch 2 (Relationship) jalan.

## Yang dibangun di patch ini

1. **`core/domain/timeline/`** — `TimelineEvent`: catatan satu momen
   penting (milestone) dalam hubungan. Immutable setelah dibuat. Dua jenis
   event yang dikenal sekarang: `first_conversation` (cuma tercatat SEKALI)
   dan `relationship_level_up` (boleh berulang, tiap kali naik level).
2. **`TimelineRuntime`** — TIDAK menentukan sendiri kapan milestone
   terjadi, cuma menyediakan method untuk mencatatnya. Keputusan "kapan
   panggil" ada di tangan caller (`ConversationRuntime` di patch 5),
   berdasarkan sinyal dari Relationship Runtime (`leveledUp`).
3. **Prisma schema** — tambah model `TimelineEvent` + enum `TimelineEventType`.
4. **Script `pnpm test:timeline -- <email>`** — cek 3 hal: milestone
   percakapan pertama tidak dobel kalau dijalankan berkali-kali, contoh
   pencatatan level up, dan daftar semua milestone yang sudah ada.

## Kenapa `first_conversation` dicegah dobel tapi `relationship_level_up` tidak?

Sengaja beda perilaku by design: "percakapan pertama" itu momen yang
SECARA DEFINISI cuma terjadi sekali dalam hidup satu companion — kalau
event ini tercatat 2x, itu berarti ada bug. Sebaliknya, "naik level" itu
memang seharusnya terjadi BERULANG KALI seiring waktu (level 1→2→3→4→5),
jadi tidak ada pengecekan duplikat untuk jenis ini.

## Cara extract & setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate      # nama migration: add_timeline_event
```

## Cara verifikasi

**Jalankan 2 KALI berturut-turut** (penting, untuk lihat perbedaan run pertama vs kedua):

```bash
pnpm test:timeline -- aji@pao.test
```

**Run pertama** harus muncul:
```
--- Mencoba catat milestone: percakapan pertama ---
✅ Tercatat baru: "Percakapan pertama dimulai"

--- Mencoba catat milestone: level up (contoh) ---
✅ Tercatat: "Hubungan naik ke Level X: ..."
...
```

**Run kedua** (jalankan lagi persis sama) harus muncul:
```
--- Mencoba catat milestone: percakapan pertama ---
(sudah pernah tercatat sebelumnya — tidak dobel, sesuai desain)

--- Mencoba catat milestone: level up (contoh) ---
✅ Tercatat: "Hubungan naik ke Level X: ..."   <- INI muncul LAGI, wajar (boleh berulang)
```

Di bagian "Semua milestone tercatat", pastikan `first_conversation` cuma
muncul **1 kali** meski Anda jalankan script berkali-kali, sementara
`relationship_level_up` bertambah tiap kali dijalankan.

Cek juga `pnpm db:studio` — tabel `timeline_events` untuk konfirmasi visual.

## Yang BELUM ada (menyusul)
- Patch 4: `Character` diperluas
- **Patch 5 (penting)**: Sambungkan Memory+Relationship+Timeline ke
  `ConversationRuntime` — di sinilah `recordFirstConversationIfNeeded()`
  dan `recordLevelUp()` benar-benar dipanggil otomatis tiap chat, bukan
  cuma lewat script manual seperti sekarang
- Patch 6: Integration test konsistensi
