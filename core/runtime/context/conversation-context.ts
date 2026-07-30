import { PersonaType } from "../../domain/character/character.entity";
import { MessageRole } from "../../domain/conversation/message-role";

// Hasil rakitan Context Assembler — "bahan mentah" yang lengkap dan siap
// dipakai Prompt Builder. Context Runtime TIDAK tahu cara menyusun prompt
// (itu tanggung jawab Prompt Runtime) — pemisahan ini sengaja supaya:
// - Context Runtime fokus "ambil data dari mana saja" (companion, history,
//   nanti di Phase 3: memory, relationship, timeline)
// - Prompt Runtime fokus "susun jadi teks yang dikirim ke LLM"
export interface ConversationContext {
  companion: {
    name: string;
    personaType: PersonaType;
    appearanceDescription: string;
    personalityDescription: string | null;
  };
  history: { role: MessageRole; content: string }[];   // kronologis: lama -> baru
  latestUserMessage: string;
}
