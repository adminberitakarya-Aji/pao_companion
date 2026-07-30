import { PrismaClient } from "@prisma/client";
import { Conversation } from "../../../domain/conversation/conversation.entity";
import { ConversationRepository } from "../../../domain/conversation/conversation.repository";

export class PrismaConversationRepository implements ConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCompanionId(companionId: string): Promise<Conversation | null> {
    const record = await this.prisma.conversation.findUnique({ where: { companionId } });
    if (!record) return null;
    return Conversation.create({
      id: record.id,
      companionId: record.companionId,
      createdAt: record.createdAt,
    });
  }

  async save(conversation: Conversation): Promise<void> {
    await this.prisma.conversation.upsert({
      where: { id: conversation.id },
      create: { id: conversation.id, companionId: conversation.companionId },
      update: {},   // Conversation tidak punya field yang bisa berubah (cuma pembungkus)
    });
  }
}
