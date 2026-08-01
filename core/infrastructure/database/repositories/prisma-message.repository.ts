import { PrismaClient, MessageRole as PrismaMessageRole } from "@prisma/client";
import { Message } from "../../../domain/conversation/message.entity";
import { MessageRepository, RecentMessagesQuery } from "../../../domain/conversation/message.repository";
import { MessageRole } from "../../../domain/conversation/message-role";

const toDomainRole = (value: PrismaMessageRole): MessageRole =>
  value === "USER" ? "user" : "companion";

const toPrismaRole = (value: MessageRole): PrismaMessageRole =>
  value === "user" ? "USER" : "COMPANION";

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(message: Message): Promise<void> {
    await this.prisma.message.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        role: toPrismaRole(message.role),
        content: message.content,
        createdAt: message.createdAt,
      },
    });
  }

  async findRecent(query: RecentMessagesQuery): Promise<Message[]> {
    // Ambil N TERBARU (orderBy desc), lalu balik urutan jadi kronologis
    // (lama -> baru) — supaya konsumen (Context Assembler) langsung bisa
    // pakai tanpa perlu sort ulang.
    const records = await this.prisma.message.findMany({
      where: { conversationId: query.conversationId },
      orderBy: { createdAt: "desc" },
      take: query.limit,
    });

    return records
      .reverse()
      .map((r) =>
        Message.create({
          id: r.id,
          conversationId: r.conversationId,
          role: toDomainRole(r.role),
          content: r.content,
          createdAt: r.createdAt,
        }),
      );
  }

  async countCompanionMessages(conversationId: string): Promise<number> {
    return this.prisma.message.count({
      where: { conversationId, role: "COMPANION" },
    });
  }
}
