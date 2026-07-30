import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { PrismaCompanionRepository } from "../../../../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaConversationRepository } from "../../../../core/infrastructure/database/repositories/prisma-conversation.repository";
import { PrismaMessageRepository } from "../../../../core/infrastructure/database/repositories/prisma-message.repository";
import { ContextAssembler } from "../../../../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../../../../core/runtime/prompt/prompt-builder.service";
import { ProviderRuntime } from "../../../../core/runtime/provider/provider-runtime.service";
import { ConversationRuntime } from "../../../../core/runtime/conversation/conversation-runtime.service";
import { LlmProviderFactory } from "../../../../core/infrastructure/providers/llm/llm-provider.factory";
import { ConsoleLogger } from "../../../../core/shared/logger/logger";
import { CompanionNotFoundError } from "../../../../core/domain/companion/companion.errors";
import { HandleUserMessageResult } from "../../../../core/runtime/conversation/conversation-runtime.dto";

const DEFAULT_HISTORY_LIMIT = 50;

// Sama seperti AuthService & CompanionService — HANYA wiring. Business
// logic ada sepenuhnya di ConversationRuntime (core/runtime/conversation).
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

    const contextAssembler = new ContextAssembler(
      this.companionRepository,
      this.messageRepository,
    );
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("Conversation");
    const providerRuntime = new ProviderRuntime(new LlmProviderFactory(), logger);

    this.conversationRuntime = new ConversationRuntime(
      this.conversationRepository,
      this.messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
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
      return [];   // belum pernah chat sama sekali — wajar, bukan error
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
