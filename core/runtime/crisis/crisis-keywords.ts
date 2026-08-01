// Kata kunci indikasi distress/ide bunuh diri atau menyakiti diri —
// bilingual ID/EN. Ini heuristik V1 (keyword match), SENGAJA dibuat
// sensitif (rather-safe-than-sorry): false positive di sini cuma berarti
// user dapat pesan suportif + nomor bantuan lebih sering dari perlu, jauh
// lebih aman daripada false negative.
//
// BEDA dengan moderation-rules.ts kategori self_harm_instruction: itu soal
// permintaan METODE ("cara bunuh diri yang..."), ini soal ide/perasaan
// ("aku pengen mati", "capek hidup"). Keduanya bisa sama-sama match kalau
// pesan mengandung dua-duanya — crisis response diprioritaskan di
// ConversationRuntime karena keselamatan user lebih penting daripada
// menegakkan kebijakan konten.
export const CRISIS_KEYWORDS: RegExp[] = [
  /\b(ingin|pengen|pingin)\s+mati\b/i,
  /\bbunuh\s?diri\b/i,
  /\bmengakhiri\s+hidup(ku|ku)?\b/i,
  /\b(capek|lelah|cape)\s+(banget\s+)?hidup\b/i,
  /\bmenyakiti\s+diri(ku)?\s+sendiri\b/i,
  /\btidak\s+ada\s+gunanya\s+(aku\s+)?hidup\b/i,
  /\blebih\s+baik\s+aku\s+(mati|tidak\s+ada)\b/i,
  /\b(kill\s+myself|end\s+my\s+life|suicidal|self[\s-]?harm|want\s+to\s+die|don'?t\s+want\s+to\s+live)\b/i,
];
