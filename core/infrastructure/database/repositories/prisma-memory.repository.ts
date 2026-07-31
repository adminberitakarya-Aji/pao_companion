import { PrismaClient } from "@prisma/client";
import { Memory } from "../../../domain/memory/memory.entity";
import { MemoryRepository } from "../../../domain/memory/memory.repository";

export class PrismaMemoryRepository implements MemoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(memory: Memory): Promise<void> {
    await this.prisma.memory.create({
      data: {
        id: memory.id,
        companionId: memory.companionId,
        content: memory.content,
        createdAt: memory.createdAt,
      },
    });
  }

  async findByCompanionId(companionId: string, limit: number): Promise<Memory[]> {
    const records = await this.prisma.memory.findMany({
      where: { companionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((r) =>
      Memory.create({
        id: r.id,
        companionId: r.companionId,
        content: r.content,
        createdAt: r.createdAt,
      }),
    );
  }
}
