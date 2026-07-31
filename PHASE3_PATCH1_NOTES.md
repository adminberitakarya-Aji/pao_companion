# Phase 3 (patch 1/6) — Memory — Catatan Penerapan

Task: **P3-1** dari `ROADMAP.md`. Melanjutkan seluruh patch Phase 1 & 2 —
extract SETELAH semuanya jalan (termasuk hotfix 1 & 2, dan patch 4/4 Phase 2).

## Yang dibangun di patch ini

1. **`core/domain/memory/`** — `Memory` entity: satu fakta personal
   tentang user (mis. "User bekerja sebagai guru SD di Semarang").
   Sengaja "flat" (teks bebas), bukan struktur key-value kaku.
2. **`core/runtime/memory/` — `MemoryExtractor`**: panggil LLM dengan
   prompt KHUSUS (beda dari prompt chat biasa) untuk menyaring fakta
   personal dari satu pertukaran pesan, balas dalam format JSON array.
   Kalau extraction gagal (network error, JSON tidak valid, dst) — **tidak
   menggagalkan apa pun**, cuma di-log dan dikembalikan array kosong.
3. **`MemoryRuntime`** — orkestrator: panggil extractor, simpan tiap fakta
   sebagai `Memory` record, sediakan `getRecentMemories()` untuk dipakai
   Context Assembler nanti (patch 5).
4. **Prisma schema** — tambah model `Memory`.
5. **Script `pnpm test:memory -- "<pesan>" "<balasan>" [email]`** — tes
   extraction standalone, opsional simpan ke DB kalau kasih email.

## PENTING: patch ini BELUM tersambung ke percakapan utama

`MemoryExtractor`/`MemoryRuntime` di patch ini **BELUM dipanggil otomatis**
dari `ConversationRuntime` setiap kali chat — itu baru terjadi di **patch 5
(Context/Prompt update)**, setelah Relationship & Timeline juga selesai
dibangun, supaya penyambungannya dilakukan sekali untuk ketiganya sekaligus
(bukan trial-and-error connect satu-satu). Untuk sekarang, cara satu-satunya
memicu extraction adalah lewat script manual di atas.

## Cara extract & setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate      # nama migration: add_memory
```

## Cara verifikasi

**1. Tes extraction tanpa simpan (cepat, cuma cek kualitas ekstraksi):**
```bash
pnpm test:memory -- "Aku kerja sebagai guru SD di Semarang, udah 3 tahun" "Wah keren! Pasti seru ya ngajar anak-anak"
```
Harus muncul fakta semacam:
```
=== Fakta yang berhasil diekstrak ===
1. User bekerja sebagai guru SD
2. User tinggal di Semarang
3. User sudah mengajar selama 3 tahun
```

**2. Tes dengan kalimat basa-basi (harus TIDAK menghasilkan fakta):**
```bash
pnpm test:memory -- "Hehe iya deh" "Aduh gemesin banget sih kamu"
```
Harus muncul `(tidak ada — wajar kalau pesan tidak mengandung info personal baru)`

**3. Tes dengan simpan ke DB:**
```bash
pnpm test:memory -- "Aku suka banget kopi, tiap pagi harus ngopi dulu" "Sama! Aku juga suka kopi" aji@pao.test
```
Cek `pnpm db:studio` — tabel `memories` harus terisi.

Tempel hasil ketiganya — terutama perhatikan apakah kualitas ekstraksinya
masuk akal (tidak mengarang fakta yang tidak disebutkan, tidak menyimpan
basa-basi) sebelum kita lanjut ke patch 2 (Relationship).

## Yang BELUM ada (menyusul)
- Patch 2: Domain `Relationship` (level kedekatan)
- Patch 3: Domain `Timeline` (milestone hubungan)
- Patch 4: `Character` diperluas
- Patch 5: Sambungkan Memory+Relationship+Timeline ke Context Assembler & Prompt Builder — BARU di sini memory benar-benar mempengaruhi percakapan
- Patch 6: Integration test konsistensi
