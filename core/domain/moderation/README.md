# domain/moderation (Phase 4 — P4-1)

Entity `ModerationFlag` — catatan audit setiap kali `ContentModerator`
(`core/runtime/moderation`) menemukan konten bermasalah, baik dari pesan
USER maupun balasan COMPANION.

Domain ini TIDAK berisi logic deteksi (rule/keyword) — itu ada di runtime
layer, karena rule bisa berubah/di-tuning tanpa perlu ubah bentuk data.
Domain cuma mendefinisikan bentuk catatan hasil deteksi.

- `sexual_minor` **selalu** `block`, tidak pernah `flag` — tidak ada
  toleransi untuk konten yang menyinggung anak di bawah umur secara
  seksual/romantis, sesuai `docs/09-safety-and-trust/content-policy.md`.
- Kategori lain bisa `flag` (tetap tampil, dicatat untuk review) atau
  `block` (dihentikan) tergantung severity match di rule engine.
