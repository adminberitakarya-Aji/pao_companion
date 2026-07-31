# Phase 3 (patch 2/6) — Relationship — Catatan Penerapan

Task: **P3-2** dari `ROADMAP.md`. Extract setelah patch 1 (Memory) jalan.

## Yang dibangun di patch ini

1. **`core/domain/relationship/`** — `Relationship` entity: poin akumulatif
   (`affectionPoints`) yang menentukan `level` (1-5, dari "Baru kenal"
   sampai "Sangat erat"). Method `addPoints()` return `true` kalau level
   BARU SAJA naik — sinyal ini akan dipakai Timeline Runtime (patch 3)
   untuk mencatat milestone, dan Provider Runtime (patch 5) untuk memicu
   `premium-moment` (Claude, bukan Gemini) di momen tersebut.
2. **`RelationshipScorer`** — heuristik SEDERHANA (bukan LLM call): poin
   dasar per pertukaran pesan + bonus kecil kalau pesan user cukup panjang.
   **Ini bukan pengukuran kualitas emosional sungguhan** — cuma starting
   point yang mudah diganti nanti (mis. jadi sentiment-based) tanpa
   menyentuh `RelationshipRuntime` atau domain `Relationship`.
3. **`RelationshipRuntime`** — orkestrator: cari/buat Relationship, hitung
   poin, simpan, beri tahu apakah level naik.
4. **Prisma schema** — tambah model `Relationship`.
5. **Script `pnpm test:relationship -- <email> [jumlah]`** — simulasi N
   pertukaran pesan (BUKAN pesan sungguhan yang tersimpan sebagai
   `Message`) supaya Anda bisa lihat progres level tanpa harus benar-benar
   chat puluhan/ratusan kali.

## Sama seperti Memory — BELUM tersambung ke percakapan utama

`RelationshipRuntime` belum dipanggil otomatis dari `ConversationRuntime`.
Penyambungan (supaya poin naik otomatis tiap kali chat sungguhan) terjadi
di **patch 5**, bareng dengan Memory dan Timeline.

## Cara extract & setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate      # nama migration: add_relationship
```

## Cara verifikasi

```bash
pnpm test:relationship -- aji@pao.test 30
```

Harus muncul progres semacam:
```
Relationship saat ini: Level 1 (Baru kenal), 0 poin

Mensimulasikan 30 pertukaran pesan...

[1/30] +poin -> Level 1 (Baru kenal), total 5 poin
[2/30] +poin -> Level 1 (Baru kenal), total 10 poin
...
[20/30] +poin -> Level 2 (Mulai akrab), total 105 poin 🎉 LEVEL UP!
...

✅ Simulasi selesai.
```

Perhatikan apakah kecepatan naik level terasa wajar (tidak terlalu cepat/
lambat) — kalau menurut Anda pacing-nya perlu diubah (misal biar naik
level lebih cepat/lambat), kabari saya, gampang di-tuning di
`relationship-level.ts` (threshold poin) atau `relationship-scorer.service.ts`
(poin per pesan) tanpa mengubah bagian lain.

Cek juga `pnpm db:studio` — tabel `relationships` harus terisi dengan
`affectionPoints` sesuai jumlah pesan yang disimulasikan.

## Yang BELUM ada (menyusul)
- Patch 3: Domain `Timeline` (milestone hubungan — akan konsumsi sinyal
  `leveledUp` dari patch ini)
- Patch 4: `Character` diperluas
- Patch 5: Sambungkan Memory+Relationship+Timeline ke Context Assembler & Prompt Builder — di sinilah relationship level benar-benar mempengaruhi gaya balasan companion dan pemilihan provider LLM
- Patch 6: Integration test konsistensi
