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
import {
  ContentModerator,
  MODERATION_BLOCKED_REPLY_FALLBACK_ID,
} from "../moderation/content-moderator.service";
import { CrisisDetector } from "../crisis/crisis-detector.service";
import { CRISIS_SAFE_RESPONSE_ID } from "../crisis/crisis-response";
import { AiDisclosureReminder, AI_DISCLOSURE_REMINDER_MESSAGE_ID } from "../disclosure/ai-disclosure.service";
import { ModerationFlagRepository } from "../../domain/moderation/moderation-flag.repository";
import { ModerationFlag } from "../../domain/moderation/moderation-flag.entity";
import { ModerationCategory } from "../../domain/moderation/moderation-category";
import { BlockedContentError } from "../../domain/moderation/moderation.errors";
import { CrisisEventRepository } from "../../domain/crisis/crisis-event.repository";
import { CrisisEvent } from "../../domain/crisis/crisis-event.entity";
import { Logger } from "../../shared/logger/logger";
import { HandleUserMessageInput, HandleUserMessageResult } from "./conversation-runtime.dto";

const CRISIS_RESPONSE_PROVIDER_ID = "crisis-safe-response";

// Conversation Runtime — ORKESTRATOR UTAMA. Sejak Phase 4, urutan
// lengkapnya:
//   1. Cari/buat Conversation
//   2. Moderasi pesan USER — kalau "block", lempar BlockedContentError
//      SEBELUM apa pun disimpan atau provider dipanggil (P4-1)
//   3. Catat milestone "percakapan pertama" kalau belum pernah (Timeline)
//   4. Simpan pesan user (kalau lolos moderasi/cuma "flag", tetap simpan
//      + catat ModerationFlag untuk review)
//   5. Deteksi krisis (P4-4) — kalau terdeteksi: SKIP provider LLM,
//      pakai safe-response, catat CrisisEvent, lewati langkah 6-9 di
//      bawah (relationship/timeline/memory tidak diproses untuk giliran
//      krisis), lalu return lebih awal
//   6. Proses Relationship — SEBELUM generate balasan, supaya kalau
//      exchange ini bikin level naik, balasan companion untuk momen itu
//      bisa pakai provider premium (Claude), bukan default (Gemini)
//   7. Kalau level naik: catat milestone "relationship_level_up" (Timeline)
//   8. Rakit context (Character + Relationship + Memory + history)
//   9. Susun prompt, panggil provider
//   10. Moderasi balasan COMPANION — kalau "block", ganti dengan fallback
//       aman (P4-1); provider pihak ketiga tidak selalu bisa diprediksi
//       walau input aman
//   11. Simpan balasan companion
//   12. Ekstrak & simpan Memory baru dari exchange ini (SKIP kalau balasan
//       companion di-block — tidak ada exchange bermakna untuk diekstrak)
//   13. Hitung apakah giliran ini perlu AI disclosure reminder (P4-2)
//
// Semua dependency Phase 3 & 4 SENGAJA OPSIONAL — supaya kode/test lama
// yang instantiate ConversationRuntime dengan argumen lebih sedikit tetap
// jalan tanpa perlu diubah, cukup dengan fitur yang otomatis di-skip
// kalau tidak disediakan. TAPI: di production, contentModerator &
// crisisDetector WAJIB disediakan (lihat wiring di apps/api) — DoD Phase 4
// mensyaratkan semua percakapan publik melewati kedua lapisan ini.
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
    private readonly contentModerator?: ContentModerator,
    private readonly moderationFlagRepository?: ModerationFlagRepository,
    private readonly crisisDetector?: CrisisDetector,
    private readonly crisisEventRepository?: CrisisEventRepository,
    private readonly aiDisclosureReminder?: AiDisclosureReminder,
  ) {}

  async handleUserMessage(input: HandleUserMessageInput): Promise<HandleUserMessageResult> {
    const conversation = await this.getOrCreateConversation(input.companionId);

    if (this.contentModerator) {
      const userModeration = this.contentModerator.evaluate(input.userMessage);

      if (userModeration.action === "block") {
        await this.logModerationFlag({
          companionId: input.companionId,
          conversationId: conversation.id,
          messageId: null,
          source: "user",
          action: "block",
          category: userModeration.category as ModerationCategory,
          matchedTerm: userModeration.matchedTerm as string,
          content: input.userMessage,
        });
        this.logger.warn("Pesan user diblokir kebijakan konten", {
          companionId: input.companionId,
          category: userModeration.category,
        });
        throw new BlockedContentError(userModeration.category as ModerationCategory);
      }

      if (userModeration.action === "flag") {
        await this.logModerationFlag({
          companionId: input.companionId,
          conversationId: conversation.id,
          messageId: null,
          source: "user",
          action: "flag",
          category: userModeration.category as ModerationCategory,
          matchedTerm: userModeration.matchedTerm as string,
          content: input.userMessage,
        });
      }
    }

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

    // --- P4-4: krisis dicek SETELAH pesan user tersimpan (riwayat tetap
    // utuh) TAPI SEBELUM provider LLM dipanggil sama sekali. ---
    if (this.crisisDetector) {
      const crisisResult = this.crisisDetector.detect(input.userMessage);
      if (crisisResult.detected) {
        return this.respondToCrisis(
          input.companionId,
          conversation.id,
          input.userMessage,
          crisisResult.matchedKeyword as string,
        );
      }
    }

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

    let companionReplyContent = result.content;
    let companionReplyBlocked = false;

    if (this.contentModerator) {
      const companionModeration = this.contentModerator.evaluate(result.content);

      if (companionModeration.action === "block") {
        await this.logModerationFlag({
          companionId: input.companionId,
          conversationId: conversation.id,
          messageId: null,
          source: "companion",
          action: "block",
          category: companionModeration.category as ModerationCategory,
          matchedTerm: companionModeration.matchedTerm as string,
          content: result.content,
        });
        this.logger.warn("Balasan companion diblokir kebijakan konten, diganti fallback", {
          companionId: input.companionId,
          category: companionModeration.category,
        });
        companionReplyContent = MODERATION_BLOCKED_REPLY_FALLBACK_ID;
        companionReplyBlocked = true;
      } else if (companionModeration.action === "flag") {
        await this.logModerationFlag({
          companionId: input.companionId,
          conversationId: conversation.id,
          messageId: null,
          source: "companion",
          action: "flag",
          category: companionModeration.category as ModerationCategory,
          matchedTerm: companionModeration.matchedTerm as string,
          content: result.content,
        });
      }
    }

    // Hitung SEBELUM simpan balasan baru — AiDisclosureReminder butuh
    // jumlah balasan companion SEBELUM giliran ini untuk tahu apakah
    // giliran ini adalah giliran ke-N (N = interval).
    const aiDisclosureReminderText = await this.computeDisclosureReminder(conversation.id);

    const companionMessage = Message.create({
      id: randomUUID(),
      conversationId: conversation.id,
      role: "companion",
      content: companionReplyContent,
    });
    await this.messageRepository.save(companionMessage);

    if (this.memoryRuntime && !companionReplyBlocked) {
      await this.memoryRuntime.processExchange(input.companionId, {
        userMessage: input.userMessage,
        companionReply: companionReplyContent,
      });
    }

    this.logger.info("Pesan berhasil diproses", {
      conversationId: conversation.id,
      providerId: result.providerId,
      leveledUp,
    });

    return {
      conversationId: conversation.id,
      reply: companionReplyContent,
      providerId: result.providerId,
      relationshipLevel,
      leveledUp,
      crisisResponse: false,
      aiDisclosureReminder: aiDisclosureReminderText,
    };
  }

  private async respondToCrisis(
    companionId: string,
    conversationId: string,
    userMessage: string,
    matchedKeyword: string,
  ): Promise<HandleUserMessageResult> {
    if (this.crisisEventRepository) {
      const event = CrisisEvent.create({
        id: randomUUID(),
        companionId,
        conversationId,
        keyword: matchedKeyword,
        content: userMessage,
      });
      await this.crisisEventRepository.save(event);
    }

    const safeReplyMessage = Message.create({
      id: randomUUID(),
      conversationId,
      role: "companion",
      content: CRISIS_SAFE_RESPONSE_ID,
    });
    await this.messageRepository.save(safeReplyMessage);

    this.logger.warn("Indikasi krisis terdeteksi — safe-response dikirim, LLM provider di-skip", {
      companionId,
      conversationId,
    });

    // Relationship/Timeline/Memory SENGAJA di-skip untuk giliran krisis —
    // lihat catatan alur di kepala class.
    return {
      conversationId,
      reply: CRISIS_SAFE_RESPONSE_ID,
      providerId: CRISIS_RESPONSE_PROVIDER_ID,
      relationshipLevel: null,
      leveledUp: false,
      crisisResponse: true,
      aiDisclosureReminder: null,
    };
  }

  private async computeDisclosureReminder(conversationId: string): Promise<string | null> {
    if (!this.aiDisclosureReminder) return null;
    const priorCompanionCount = await this.messageRepository.countCompanionMessages(conversationId);
    return this.aiDisclosureReminder.shouldRemind(priorCompanionCount)
      ? AI_DISCLOSURE_REMINDER_MESSAGE_ID
      : null;
  }

  private async logModerationFlag(params: {
    companionId: string;
    conversationId: string | null;
    messageId: string | null;
    source: "user" | "companion";
    action: "flag" | "block";
    category: ModerationCategory;
    matchedTerm: string;
    content: string;
  }): Promise<void> {
    if (!this.moderationFlagRepository) return;

    const flag = ModerationFlag.create({
      id: randomUUID(),
      companionId: params.companionId,
      conversationId: params.conversationId,
      messageId: params.messageId,
      source: params.source,
      category: params.category,
      action: params.action,
      matchedTerm: params.matchedTerm,
      content: params.content,
    });
    await this.moderationFlagRepository.save(flag);
  }

  private async getOrCreateConversation(companionId: string) {
    const existing = await this.conversationRepository.findByCompanionId(companionId);
    if (existing) return existing;

    const conversation = Conversation.create({ id: randomUUID(), companionId });
    await this.conversationRepository.save(conversation);
    return conversation;
  }
}
