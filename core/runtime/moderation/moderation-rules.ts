import { ModerationAction } from "../../domain/moderation/moderation-action";
import { ModerationCategory } from "../../domain/moderation/moderation-category";

export interface ModerationRule {
  category: ModerationCategory;
  action: ModerationAction;
  pattern: RegExp;
}

// Heuristik rule-based (V1) — bilingual ID/EN, case-insensitive. Ini
// LAPISAN PERTAMA, bukan satu-satunya lapisan: cukup untuk menangkap kasus
// jelas & mencegah data mentah tersimpan/tertampil tanpa jeda. Sebelum
// rilis publik (Phase 6), pertimbangkan tambah classifier/moderation API
// pihak ketiga sebagai lapisan kedua untuk kasus yang lebih halus/samar —
// jangan andalkan keyword list ini sendirian di production.
//
// Urutan dalam array TIDAK menentukan prioritas — evaluate() di
// content-moderator.service.ts selalu mengutamakan SEMUA match "block"
// dulu sebelum "flag", apa pun urutannya di sini.
export const MODERATION_RULES: ModerationRule[] = [
  // --- sexual_minor: SELALU block, tanpa toleransi. Pola: indikator usia
  // anak-anak (SD/SMP, "di bawah umur", "anak kecil", dst.) yang muncul
  // berdekatan dengan konteks romantis/seksual companion. ---
  {
    category: "sexual_minor",
    action: "block",
    pattern:
      /\b(anak\s?smp|anak\s?sd|di\s?bawah\s?umur|underage|masih\s?kecil|belum\s?dewasa|umur\s?1[0-6]\s?tahun)\b/i,
  },

  // --- self_harm_instruction: permintaan METODE/cara menyakiti diri atau
  // bunuh diri — beda dengan IDE/distress (ditangani modul crisis, yang
  // meresponsnya dengan bantuan, bukan blokir). ---
  {
    category: "self_harm_instruction",
    action: "block",
    pattern:
      /\b(cara(nya)?\s+(bunuh\s?diri|mengakhiri\s?hidup|menyakiti\s?diri)|dosis\s+.*(mematikan|overdosis)|how\s+to\s+(kill\s+myself|end\s+my\s+life|self[\s-]?harm))\b/i,
  },

  // --- illegal_activity: permintaan bantuan memperoleh/membuat sesuatu
  // yang jelas ilegal. ---
  {
    category: "illegal_activity",
    action: "block",
    pattern:
      /\b(cara\s+(membuat|merakit)\s+(bom|senjata\s?api|narkoba)|beli\s+(narkoba|sabu|ekstasi)\s+(online|dimana))\b/i,
  },

  // --- violence_extreme: deskripsi kekerasan grafis ekstrem yang tidak
  // wajar untuk companion romantis (bukan sekadar kata "berkelahi"). ---
  {
    category: "violence_extreme",
    action: "flag",
    pattern: /\b(mutilasi|torture\s+someone|menyiksa\s+sampai\s+mati)\b/i,
  },

  // --- hate_harassment: V1 hanya menangkap ANCAMAN eksplisit berbasis
  // identitas (bukan daftar kata kasar/slur — sengaja TIDAK di-hardcode di
  // sini, karena daftar seperti itu butuh kurasi manusia yang hati-hati
  // dan idealnya pakai layanan moderation API pihak ketiga, bukan regex).
  // TODO(P4-1 follow-up): integrasikan moderation API pihak ketiga sebagai
  // lapisan kedua sebelum rilis publik — lihat catatan di atas.
  {
    category: "hate_harassment",
    action: "flag",
    pattern: /\b(bunuh\s+semua\s+\w+|usir\s+semua\s+\w+\s+dari\s+negeri\s+ini)\b/i,
  },
];
