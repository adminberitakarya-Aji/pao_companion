import { PrismaClient } from "@prisma/client";
import { CrisisEvent } from "../../../domain/crisis/crisis-event.entity";
import { CrisisEventRepository } from "../../../domain/crisis/crisis-event.repository";

export class PrismaCrisisEventRepository implements CrisisEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(event: CrisisEvent): Promise<void> {
    await this.prisma.crisisEvent.create({
      data: {
        id: event.id,
        companionId: event.companionId,
        conversationId: event.conversationId,
        keyword: event.keyword,
        messageSnippet: event.messageSnippet,
        createdAt: event.createdAt,
      },
    });
  }

  async findByCompanionId(companionId: string, limit: number): Promise<CrisisEvent[]> {
    const records = await this.prisma.crisisEvent.findMany({
      where: { companionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((r) =>
      CrisisEvent.create({
        id: r.id,
        companionId: r.companionId,
        conversationId: r.conversationId,
        keyword: r.keyword,
        content: r.messageSnippet, // sudah snippet
        createdAt: r.createdAt,
      }),
    );
  }
}
