import { ModerationAction } from "../../domain/moderation/moderation-action";
import { ModerationCategory } from "../../domain/moderation/moderation-category";
import { MODERATION_RULES } from "./moderation-rules";

// Dipakai MENGGANTIKAN balasan companion kalau moderasi men-block OUTPUT
// provider LLM (bukan input user) — kasus jarang tapi mungkin, karena
// provider pihak ketiga tidak selalu bisa diprediksi sepenuhnya.
export const MODERATION_BLOCKED_REPLY_FALLBACK_ID =
  "Maaf, aku tidak bisa membalas itu. Yuk kita ngobrolin hal lain.";

export interface ModerationResult {
  action: "allow" | ModerationAction;
  category?: ModerationCategory;
  matchedTerm?: string;
}

// Content Moderator — rule engine sederhana (P4-1). Dipanggil oleh
// ConversationRuntime untuk pesan USER (sebelum disimpan) DAN balasan
// COMPANION (sebelum disimpan/ditampilkan) — dua arah, karena provider LLM
// pihak ketiga bisa saja menghasilkan output bermasalah walau input aman.
export class ContentModerator {
  evaluate(text: string): ModerationResult {
    // "block" SELALU dicek & dimenangkan duluan, terlepas urutan rule di
    // MODERATION_RULES — konten yang harus diblokir tidak boleh lolos
    // gara-gara ada rule "flag" lain yang kebetulan match lebih dulu.
    const blockMatch = this.findMatch(text, "block");
    if (blockMatch) return blockMatch;

    const flagMatch = this.findMatch(text, "flag");
    if (flagMatch) return flagMatch;

    return { action: "allow" };
  }

  private findMatch(text: string, action: ModerationAction): ModerationResult | null {
    for (const rule of MODERATION_RULES) {
      if (rule.action !== action) continue;
      const match = text.match(rule.pattern);
      if (match) {
        return { action: rule.action, category: rule.category, matchedTerm: match[0] };
      }
    }
    return null;
  }
}
