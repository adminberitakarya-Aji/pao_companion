# Content Policy

Status: **diimplementasikan** — lihat `core/domain/moderation/` &
`core/runtime/moderation/` (P4-1).

## Prinsip

PAO Companion adalah platform companion AI dengan persona romantis
(GIRLFRIEND/BOYFRIEND). Kebebasan berekspresi dalam percakapan companion
dihormati selama tidak melanggar batas berikut — batas ini **tidak bisa
dinegosiasikan lewat prompt/roleplay/karakter apa pun**:

1. **Konten seksual/romantis yang menyinggung anak di bawah umur** —
   dilarang mutlak, tanpa pengecualian, tanpa toleransi "cuma fiksi" atau
   "cuma roleplay". Kategori `sexual_minor`, selalu `block`.
2. **Konten seksual tanpa consent** (paksaan, eksploitasi) — `block`.
3. **Instruksi metode menyakiti diri/bunuh diri** — `block`. (Beda dengan
   *ide/perasaan* distress, yang ditangani sebagai sinyal krisis untuk
   dibantu, lihat `crisis-handling.md` — bukan konten yang "ditolak".)
4. **Bantuan aktivitas ilegal** (narkoba, senjata, dst.) — `block`.
5. **Kekerasan grafis ekstrem** & **ujaran kebencian/pelecehan** —
   `flag` di V1 (dicatat untuk review manusia), bisa dinaikkan jadi
   `block` seiring rule engine di-tuning.

## Bagaimana ditegakkan

- `ContentModerator.evaluate()` (`core/runtime/moderation`) mengevaluasi
  **setiap** pesan USER sebelum disimpan, dan **setiap** balasan
  COMPANION sebelum disimpan/ditampilkan — dua arah, karena provider LLM
  pihak ketiga bisa menghasilkan output bermasalah walau input aman.
- Hasil `block` pada pesan user: pesan **tidak pernah tersimpan**,
  provider LLM **tidak dipanggil**, `BlockedContentError` (HTTP 422)
  dikembalikan ke klien.
- Hasil `block` pada balasan companion: balasan asli **tidak ditampilkan**,
  diganti fallback aman.
- Setiap match (`block` maupun `flag`) dicatat sebagai `ModerationFlag`
  untuk audit — snippet saja (maks 200 karakter), bukan konten penuh.

## Keterbatasan V1 & rencana lanjutan

Rule engine saat ini berbasis regex/keyword (bilingual ID/EN) — cukup
untuk kasus jelas, **tidak** menangkap kasus samar/tersamar dengan baik.
Sebelum rilis publik (Phase 6), evaluasi integrasi moderation API pihak
ketiga sebagai lapisan kedua, terutama untuk `hate_harassment` (lihat
TODO di `core/runtime/moderation/moderation-rules.ts`).
