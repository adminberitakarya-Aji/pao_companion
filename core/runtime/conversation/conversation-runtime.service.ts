import { randomUUID } from "crypto";
import { ConversationRepository } from "../../domain/conversation/conversation.repository";
import { MessageRepository } from "../../domain/conversation/message.repository";
import { Conversation } from "../../domain/conversation/conversation.entity";
import { Message } from "../../domain/conversation/message.entity";
import { ContextAssembler } from "../context/context-assembler.service";
import { PromptBuilder } from "../prompt/prompt-builder.service";
import { ProviderRuntime } from "../provider/provider-runtime.service";
import { Logger } from "../../shared/logger/logger";
import { HandleUserMessageInput, HandleUserMessageResult } from "./conversation-runtime.dto";

// Conversation Runtime — ORKESTRATOR UTAMA vertical slice Phase 2.
// Urutan: cari/buat Conversation -> simpan pesan user -> rakit context ->
// susun prompt -> panggil provider (lewat Provider Runtime) -> simpan
// balasan companion -> return hasil.
//
// Runtime ini TIDAK tahu detail LLM provider mana yang dipakai (itu
// tanggung jawab Provider Runtime) dan TIDAK tahu cara menyusun prompt
// (itu tanggung jawab Prompt Builder) — murni orkestrasi urutan langkah.
export class ConversationRuntime {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly contextAssembler: ContextAssembler,
    private readonly promptBuilder: PromptBuilder,
    private readonly providerRuntime: ProviderRuntime,
    private readonly logger: Logger,
  ) {}

  async handleUserMessage(input: HandleUserMessageInput): Promise<HandleUserMessageResult> {
    const conversation = await this.getOrCreateConversation(input.companionId);

    // Simpan pesan user DULU (sebelum panggil LLM) — supaya kalau LLM
    // gagal total (primary & fallback dua-duanya error), pesan user tidak
    // hilang dan tetap ada di history untuk percobaan berikutnya.
    const userMessage = Message.create({
      id: randomUUID(),
      conversationId: conversation.id,
      role: "user",
      content: input.userMessage,
    });
    await this.messageRepository.save(userMessage);

    const context = await this.contextAssembler.assemble({
      conversationId: conversation.id,
      companionId: input.companionId,
      latestUserMessage: input.userMessage,
    });

    const generateInput = this.promptBuilder.build(context);

    // TODO Phase 3: tentukan "reason" dari Timeline Runtime (mis. deteksi
    // milestone hubungan) alih-alih selalu "default".
    const result = await this.providerRuntime.generateReply(generateInput);

    const companionMessage = Message.create({
      id: randomUUID(),
      conversationId: conversation.id,
      role: "companion",
      content: result.content,
    });
    await this.messageRepository.save(companionMessage);

    this.logger.info("Pesan berhasil diproses", {
      conversationId: conversation.id,
      providerId: result.providerId,
    });

    return {
      conversationId: conversation.id,
      reply: result.content,
      providerId: result.providerId,
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
