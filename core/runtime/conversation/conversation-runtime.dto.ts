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
}
