import {
  PrismaClient,
  ModerationCategory as PrismaModerationCategory,
  ModerationAction as PrismaModerationAction,
  ModerationSource as PrismaModerationSource,
} from "@prisma/client";
import { ModerationFlag } from "../../../domain/moderation/moderation-flag.entity";
import { ModerationFlagRepository } from "../../../domain/moderation/moderation-flag.repository";
import { ModerationCategory } from "../../../domain/moderation/moderation-category";
import { ModerationAction, ModerationSource } from "../../../domain/moderation/moderation-action";

const CATEGORY_TO_PRISMA: Record<ModerationCategory, PrismaModerationCategory> = {
  sexual_minor: "SEXUAL_MINOR",
  sexual_nonconsensual: "SEXUAL_NONCONSENSUAL",
  self_harm_instruction: "SELF_HARM_INSTRUCTION",
  violence_extreme: "VIOLENCE_EXTREME",
  illegal_activity: "ILLEGAL_ACTIVITY",
  hate_harassment: "HATE_HARASSMENT",
};
const CATEGORY_FROM_PRISMA: Record<PrismaModerationCategory, ModerationCategory> = {
  SEXUAL_MINOR: "sexual_minor",
  SEXUAL_NONCONSENSUAL: "sexual_nonconsensual",
  SELF_HARM_INSTRUCTION: "self_harm_instruction",
  VIOLENCE_EXTREME: "violence_extreme",
  ILLEGAL_ACTIVITY: "illegal_activity",
  HATE_HARASSMENT: "hate_harassment",
};

const toPrismaAction = (a: ModerationAction): PrismaModerationAction =>
  a === "block" ? "BLOCK" : "FLAG";
const fromPrismaAction = (a: PrismaModerationAction): ModerationAction =>
  a === "BLOCK" ? "block" : "flag";

const toPrismaSource = (s: ModerationSource): PrismaModerationSource =>
  s === "user" ? "USER" : "COMPANION";
const fromPrismaSource = (s: PrismaModerationSource): ModerationSource =>
  s === "USER" ? "user" : "companion";

export class PrismaModerationFlagRepository implements ModerationFlagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(flag: ModerationFlag): Promise<void> {
    await this.prisma.moderationFlag.create({
      data: {
        id: flag.id,
        companionId: flag.companionId,
        conversationId: flag.conversationId,
        messageId: flag.messageId,
        source: toPrismaSource(flag.source),
        category: CATEGORY_TO_PRISMA[flag.category],
        action: toPrismaAction(flag.action),
        matchedTerm: flag.matchedTerm,
        contentSnippet: flag.contentSnippet,
        createdAt: flag.createdAt,
      },
    });
  }

  async findByCompanionId(companionId: string, limit: number): Promise<ModerationFlag[]> {
    const records = await this.prisma.moderationFlag.findMany({
      where: { companionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((r) =>
      ModerationFlag.create({
        id: r.id,
        companionId: r.companionId,
        conversationId: r.conversationId,
        messageId: r.messageId,
        source: fromPrismaSource(r.source),
        category: CATEGORY_FROM_PRISMA[r.category],
        action: fromPrismaAction(r.action),
        matchedTerm: r.matchedTerm,
        content: r.contentSnippet, // sudah snippet — entity tidak akan memotong lagi (di bawah batas)
        createdAt: r.createdAt,
      }),
    );
  }
}
