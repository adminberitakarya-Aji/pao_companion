import { PersonaType } from "../../domain/character/character.entity";
import { SpeechStyle } from "../../domain/character/speech-style";
import { MessageRole } from "../../domain/conversation/message-role";
import { RelationshipLevel } from "../../domain/relationship/relationship-level";

export interface ConversationContext {
  companion: {
    name: string;
    personaType: PersonaType;
    appearanceDescription: string;
    personalityDescription: string | null;
    speechStyle: SpeechStyle | null;
    traits: readonly string[];
    backstory: string | null;
  };
  // BARU Phase 3 patch 5 — level kedekatan saat ini, dipakai Prompt Builder
  // untuk menyesuaikan kehangatan/keakraban gaya balasan.
  relationship: {
    level: RelationshipLevel;
    levelLabel: string;
    affectionPoints: number;
  };
  // BARU Phase 3 patch 5 — fakta personal yang sudah "diingat" companion
  // dari percakapan sebelumnya (hasil Memory Runtime).
  memories: string[];
  history: { role: MessageRole; content: string }[];
  latestUserMessage: string;
}
