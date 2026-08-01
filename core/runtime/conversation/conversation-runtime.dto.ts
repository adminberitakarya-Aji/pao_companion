import { RelationshipLevel } from "../../domain/relationship/relationship-level";

export interface HandleUserMessageInput {
  companionId: string;
  userMessage: string;
}

export interface HandleUserMessageResult {
  conversationId: string;
  reply: string;
  providerId: string;
  // BARU Phase 3 patch 5 — null kalau RelationshipRuntime tidak disediakan
  // (backward compatible dengan pemakaian lama ConversationRuntime).
  relationshipLevel: RelationshipLevel | null;
  leveledUp: boolean;
  // BARU Phase 4 (P4-4) — true kalau balasan ini adalah safe-response
  // krisis (CRISIS_SAFE_RESPONSE_ID), BUKAN balasan companion normal dari
  // provider LLM. UI web/mobile bisa pakai ini untuk styling berbeda
  // (mis. tombol "Hubungi bantuan" ditonjolkan).
  crisisResponse: boolean;
  // BARU Phase 4 (P4-2) — diisi tiap REMINDER_INTERVAL_MESSAGES balasan;
  // null kalau bukan giliran pengingat. Dirender terpisah dari `reply`
  // sebagai system banner, bukan dicampur ke suara companion.
  aiDisclosureReminder: string | null;
}
