// Kategori pelanggaran yang DIKENAL sistem. Union type tertutup (bukan
// string bebas) — sama seperti TimelineEventType — supaya konsisten dan
// gampang ditelusuri di dashboard admin nanti.
export type ModerationCategory =
  | "sexual_minor" // konten seksual/romantis yang menyinggung anak di bawah umur — SELALU block, tidak pernah cuma flag
  | "sexual_nonconsensual" // konten seksual paksaan/tanpa consent
  | "self_harm_instruction" // instruksi metode menyakiti diri/bunuh diri (BEDA dengan ide/distress — itu urusan modul crisis)
  | "violence_extreme" // kekerasan grafis ekstrem
  | "illegal_activity" // permintaan bantuan aktivitas ilegal (mis. narkoba, senjata)
  | "hate_harassment"; // ujaran kebencian/pelecehan berbasis identitas
