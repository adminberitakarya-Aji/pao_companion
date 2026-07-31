import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { PrismaCompanionRepository } from "../../../../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaConversationRepository } from "../../../../core/infrastructure/database/repositories/prisma-conversation.repository";
import { PrismaMessageRepository } from "../../../../core/infrastructure/database/repositories/prisma-message.repository";
import { PrismaMemoryRepository } from "../../../../core/infrastructure/database/repositories/prisma-memory.repository";
import { PrismaRelationshipRepository } from "../../../../core/infrastructure/database/repositories/prisma-relationship.repository";
import { PrismaTimelineEventRepository } from "../../../../core/infrastructure/database/repositories/prisma-timeline-event.repository";
import { ContextAssembler } from "../../../../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../../../../core/runtime/prompt/prompt-builder.service";
import { ProviderRuntime } from "../../../../core/runtime/provider/provider-runtime.service";
import { ConversationRuntime } from "../../../../core/runtime/conversation/conversation-runtime.service";
import { RelationshipRuntime } from "../../../../core/runtime/relationship/relationship-runtime.service";
import { RelationshipScorer } from "../../../../core/runtime/relationship/relationship-scorer.service";
import { TimelineRuntime } from "../../../../core/runtime/timeline/timeline-runtime.service";
import { MemoryRuntime } from "../../../../core/runtime/memory/memory-runtime.service";
import { MemoryExtractor } from "../../../../core/runtime/memory/memory-extractor.service";
import { LlmProviderFactory } from "../../../../core/infrastructure/providers/llm/llm-provider.factory";
import { GeminiFlashProvider } from "../../../../core/infrastructure/providers/llm/gemini-flash.provider";
import { ConsoleLogger } from "../../../../core/shared/logger/logger";
import { CompanionNotFoundError } from "../../../../core/domain/companion/companion.errors";
import { HandleUserMessageResult } from "../../../../core/runtime/conversation/conversation-runtime.dto";

const DEFAULT_HISTORY_LIMIT = 50;

// Wiring lengkap Phase 3 — Memory, Relationship, Timeline semua dirakit
// di sini dan disuntikkan ke ConversationRuntime. Business logic tetap
// sepenuhnya di core/, file ini HANYA merakit dependency.
@Injectable()
export class ConversationService {
  private readonly companionRepository: PrismaCompanionRepository;
  private readonly conversationRepository: PrismaConversationRepository;
  private readonly messageRepository: PrismaMessageRepository;
  private readonly conversationRuntime: ConversationRuntime;

  constructor(prisma: PrismaService) {
    this.companionRepository = new PrismaCompanionRepository(prisma);
    this.conversationRepository = new PrismaConversationRepository(prisma);
    this.messageRepository = new PrismaMessageRepository(prisma);
    const memoryRepository = new PrismaMemoryRepository(prisma);
    const relationshipRepository = new PrismaRelationshipRepository(prisma);
    const timelineEventRepository = new PrismaTimelineEventRepository(prisma);

    const contextAssembler = new ContextAssembler(
      this.companionRepository,
      this.messageRepository,
      memoryRepository,
      relationshipRepository,
    );
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("Conversation");
    const providerRuntime = new ProviderRuntime(new LlmProviderFactory(), logger);

    const relationshipRuntime = new RelationshipRuntime(
      relationshipRepository,
      new RelationshipScorer(),
      logger,
    );
    const timelineRuntime = new TimelineRuntime(timelineEventRepository, logger);

    // Memory extraction pakai Gemini Flash langsung (bukan lewat
    // ProviderRuntime) — extraction adalah tugas pendukung, bukan
    // percakapan utama, jadi tidak perlu logic fallback/premium yang sama.
    const memoryExtractor = new MemoryExtractor(new GeminiFlashProvider(), logger);
    const memoryRuntime = new MemoryRuntime(memoryRepository, memoryExtractor, logger);

    this.conversationRuntime = new ConversationRuntime(
      this.conversationRepository,
      this.messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
      relationshipRuntime,
      timelineRuntime,
      memoryRuntime,
    );
  }

  async sendMessage(ownerId: string, message: string): Promise<HandleUserMessageResult> {
    const companion = await this.companionRepository.findByOwnerId(ownerId);
    if (!companion) {
      throw new CompanionNotFoundError("Buat companion dulu sebelum mengirim pesan");
    }
    return this.conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage: message,
    });
  }

  async getHistory(ownerId: string, limit: number = DEFAULT_HISTORY_LIMIT) {
    const companion = await this.companionRepository.findByOwnerId(ownerId);
    if (!companion) {
      throw new CompanionNotFoundError("Companion belum dibuat untuk user ini");
    }

    const conversation = await this.conversationRepository.findByCompanionId(companion.id);
    if (!conversation) {
      return [];
    }

    const messages = await this.messageRepository.findRecent({
      conversationId: conversation.id,
      limit,
    });

    return messages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }
}
