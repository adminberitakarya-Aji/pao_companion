import { PrismaClient } from "@prisma/client";
import {
  RetentionQueryPort,
  RetentionPurgePort,
  RetentionCandidate,
} from "../../../application/services/retention.port";

const REDACTED_MESSAGE_PLACEHOLDER = "[pesan dihapus — kebijakan retensi data]";

// Query lintas-aggregate (User + Companion + Message) — SENGAJA raw
// Prisma langsung, bukan lewat repository per-aggregate, karena batch job
// retensi butuh JOIN yang tidak dibutuhkan alur request biasa. Lihat
// catatan di retention.port.ts.
export class PrismaRetentionQuery implements RetentionQueryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findAnonymizationCandidates(cutoff: Date): Promise<RetentionCandidate[]> {
    const users = await this.prisma.user.findMany({
      where: { anonymizedAt: null },
      select: {
        id: true,
        createdAt: true,
        companion: {
          select: {
            id: true,
            conversation: {
              select: {
                messages: {
                  orderBy: { createdAt: "desc" },
                  take: 1,
                  select: { createdAt: true },
                },
              },
            },
          },
        },
      },
    });

    const candidates: RetentionCandidate[] = [];
    for (const user of users) {
      const lastMessageAt = user.companion?.conversation?.messages[0]?.createdAt;
      const lastActivityAt = lastMessageAt ?? user.createdAt;

      if (lastActivityAt.getTime() < cutoff.getTime()) {
        candidates.push({ userId: user.id, companionId: user.companion?.id ?? null });
      }
    }
    return candidates;
  }
}

export class PrismaRetentionPurge implements RetentionPurgePort {
  constructor(private readonly prisma: PrismaClient) {}

  async purgeCompanionData(companionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findUnique({
        where: { companionId },
        select: { id: true },
      });

      if (conversation) {
        // Isi pesan di-redact, BUKAN row-nya dihapus — mempertahankan
        // struktur/jumlah percakapan untuk statistik agregat non-PII,
        // tanpa menyimpan konten personal lagi.
        await tx.message.updateMany({
          where: { conversationId: conversation.id },
          data: { content: REDACTED_MESSAGE_PLACEHOLDER },
        });
      }

      await tx.memory.deleteMany({ where: { companionId } });
    });
  }
}
