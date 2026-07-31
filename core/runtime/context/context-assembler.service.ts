import { CompanionRepository } from "../../domain/companion/companion.repository";
import { CompanionNotFoundError } from "../../domain/companion/companion.errors";
import { MessageRepository } from "../../domain/conversation/message.repository";
import { MemoryRepository } from "../../domain/memory/memory.repository";
import { RelationshipRepository } from "../../domain/relationship/relationship.repository";
import { LEVEL_LABELS, calculateLevel } from "../../domain/relationship/relationship-level";
import { ConversationContext } from "./conversation-context";

export interface AssembleContextInput {
  conversationId: string;
  companionId: string;
  latestUserMessage: string;
  historyLimit?: number;
  memoryLimit?: number;
}

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_MEMORY_LIMIT = 15;

// Context Assembler — SEKARANG juga menarik Memory & Relationship (Phase 3
// patch 5), selain Character + history percakapan (Phase 2).
//
// `memoryRepository` dan `relationshipRepository` SENGAJA OPSIONAL —
// supaya kode/test lama yang instantiate ContextAssembler cuma dengan 2
// argumen (companionRepository, messageRepository) tetap jalan tanpa
// perlu diubah, cukup dengan fallback masuk akal (level 1, tanpa memory)
// kalau kedua repo ini tidak disediakan.
export class ContextAssembler {
  constructor(
    private readonly companionRepository: CompanionRepository,
    private readonly messageRepository: MessageRepository,
    private readonly memoryRepository?: MemoryRepository,
    private readonly relationshipRepository?: RelationshipRepository,
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

    const recentMemories = this.memoryRepository
      ? await this.memoryRepository.findByCompanionId(
          input.companionId,
          input.memoryLimit ?? DEFAULT_MEMORY_LIMIT,
        )
      : [];

    const relationship = this.relationshipRepository
      ? await this.relationshipRepository.findByCompanionId(input.companionId)
      : null;
    const relationshipLevel = relationship ? relationship.level : calculateLevel(0);

    const character = companion.character;

    return {
      companion: {
        name: character.name,
        personaType: character.personaType,
        appearanceDescription: character.appearanceDescription,
        personalityDescription: character.personalityDescription,
        speechStyle: character.speechStyle,
        traits: character.traits,
        backstory: character.backstory,
      },
      relationship: {
        level: relationshipLevel,
        levelLabel: LEVEL_LABELS[relationshipLevel],
        affectionPoints: relationship?.affectionPoints ?? 0,
      },
      memories: recentMemories.map((m) => m.content),
      history: recentMessages.map((m) => ({ role: m.role, content: m.content })),
      latestUserMessage: input.latestUserMessage,
    };
  }
}
