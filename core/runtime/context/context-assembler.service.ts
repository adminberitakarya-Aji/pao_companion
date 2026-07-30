import { CompanionRepository } from "../../domain/companion/companion.repository";
import { CompanionNotFoundError } from "../../domain/companion/companion.errors";
import { MessageRepository } from "../../domain/conversation/message.repository";
import { ConversationContext } from "./conversation-context";

export interface AssembleContextInput {
  conversationId: string;
  companionId: string;
  latestUserMessage: string;
  historyLimit?: number;
}

const DEFAULT_HISTORY_LIMIT = 20;

// Context Assembler — merakit SEMUA bahan yang dibutuhkan untuk membalas
// satu pesan: data Character (persona, appearance, personality) + history
// percakapan terbaru. Di Phase 3, tempat ini yang akan diperluas untuk juga
// menarik Memory Runtime & Relationship Runtime — Prompt Builder di
// core/runtime/prompt TIDAK PERLU berubah sama sekali saat itu terjadi,
// karena dia cuma menerima ConversationContext yang sudah lengkap.
export class ContextAssembler {
  constructor(
    private readonly companionRepository: CompanionRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async assemble(input: AssembleContextInput): Promise<ConversationContext> {
    const companion = await this.companionRepository.findById(input.companionId);
    if (!companion) {
      throw new CompanionNotFoundError("Companion tidak ditemukan saat merakit context");
    }

    const recentMessages = await this.messageRepository.findRecent({
      conversationId: input.conversationId,
      limit: input.historyLimit ?? DEFAULT_HISTORY_LIMIT,
    });

    const character = companion.character;

    return {
      companion: {
        name: character.name,
        personaType: character.personaType,
        appearanceDescription: character.appearanceDescription,
        personalityDescription: character.personalityDescription,
      },
      history: recentMessages.map((m) => ({ role: m.role, content: m.content })),
      latestUserMessage: input.latestUserMessage,
    };
  }
}
