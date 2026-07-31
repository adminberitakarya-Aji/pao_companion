import { randomUUID } from "crypto";
import { ConversationRepository } from "../../domain/conversation/conversation.repository";
import { MessageRepository } from "../../domain/conversation/message.repository";
import { Conversation } from "../../domain/conversation/conversation.entity";
import { Message } from "../../domain/conversation/message.entity";
import { ContextAssembler } from "../context/context-assembler.service";
import { PromptBuilder } from "../prompt/prompt-builder.service";
import { ProviderRuntime, GenerateReplyOptions } from "../provider/provider-runtime.service";
import { RelationshipRuntime } from "../relationship/relationship-runtime.service";
import { TimelineRuntime } from "../timeline/timeline-runtime.service";
import { MemoryRuntime } from "../memory/memory-runtime.service";
import { Logger } from "../../shared/logger/logger";
import { HandleUserMessageInput, HandleUserMessageResult } from "./conversation-runtime.dto";

// Conversation Runtime — ORKESTRATOR UTAMA. Sejak Phase 3 patch 5, urutan
// lengkapnya:
//   1. Cari/buat Conversation
//   2. Catat milestone "percakapan pertama" kalau belum pernah (Timeline)
//   3. Simpan pesan user
//   4. Proses Relationship — SEBELUM generate balasan, supaya kalau exchange
//      ini bikin level naik, balasan companion untuk momen itu bisa pakai
//      provider premium (Claude), bukan default (Gemini)
//   5. Kalau level naik: catat milestone "relationship_level_up" (Timeline)
//   6. Rakit context (Character + Relationship + Memory + history)
//   7. Susun prompt
//   8. Panggil provider (Gemini default, atau Claude kalau premium-moment)
//   9. Simpan balasan companion
//   10. Ekstrak & simpan Memory baru dari exchange ini (SETELAH balasan
//       tersedia — butuh exchange lengkap user+companion)
//
// `relationshipRuntime`, `timelineRuntime`, `memoryRuntime` SENGAJA OPSIONAL
// — supaya kode/test lama (Phase 2) yang instantiate ConversationRuntime
// cuma dengan 6 argumen tetap jalan tanpa perlu diubah, cukup dengan
// fitur Phase 3 yang otomatis di-skip kalau tidak disediakan.
export class ConversationRuntime {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly contextAssembler: ContextAssembler,
    private readonly promptBuilder: PromptBuilder,
    private readonly providerRuntime: ProviderRuntime,
    private readonly logger: Logger,
    private readonly relationshipRuntime?: RelationshipRuntime,
    private readonly timelineRuntime?: TimelineRuntime,
    private readonly memoryRuntime?: MemoryRuntime,
  ) {}

  async handleUserMessage(input: HandleUserMessageInput): Promise<HandleUserMessageResult> {
    const conversation = await this.getOrCreateConversation(input.companionId);

    if (this.timelineRuntime) {
      await this.timelineRuntime.recordFirstConversationIfNeeded(input.companionId);
    }

    const userMessage = Message.create({
      id: randomUUID(),
      conversationId: conversation.id,
      role: "user",
      content: input.userMessage,
    });
    await this.messageRepository.save(userMessage);

    let providerReason: GenerateReplyOptions["reason"] = "default";
    let relationshipLevel: HandleUserMessageResult["relationshipLevel"] = null;
    let leveledUp = false;

    if (this.relationshipRuntime) {
      const scoreResult = await this.relationshipRuntime.processExchange(
        input.companionId,
        input.userMessage,
      );
      relationshipLevel = scoreResult.relationship.level;
      leveledUp = scoreResult.leveledUp;

      if (leveledUp) {
        providerReason = "premium-moment";
        if (this.timelineRuntime) {
          await this.timelineRuntime.recordLevelUp(input.companionId, scoreResult.relationship.level);
        }
      }
    }

    const context = await this.contextAssembler.assemble({
      conversationId: conversation.id,
      companionId: input.companionId,
      latestUserMessage: input.userMessage,
    });

    const generateInput = this.promptBuilder.build(context);
    const result = await this.providerRuntime.generateReply(generateInput, {
      reason: providerReason,
    });

    const companionMessage = Message.create({
      id: randomUUID(),
      conversationId: conversation.id,
      role: "companion",
      content: result.content,
    });
    await this.messageRepository.save(companionMessage);

    if (this.memoryRuntime) {
      await this.memoryRuntime.processExchange(input.companionId, {
        userMessage: input.userMessage,
        companionReply: result.content,
      });
    }

    this.logger.info("Pesan berhasil diproses", {
      conversationId: conversation.id,
      providerId: result.providerId,
      leveledUp,
    });

    return {
      conversationId: conversation.id,
      reply: result.content,
      providerId: result.providerId,
      relationshipLevel,
      leveledUp,
    };
  }

  private async getOrCreateConversation(companionId: string) {
    const existing = await this.conversationRepository.findByCompanionId(companionId);
    if (existing) return existing;

    const conversation = Conversation.create({ id: randomUUID(), companionId });
    await this.conversationRepository.save(conversation);
    return conversation;
  }
}
