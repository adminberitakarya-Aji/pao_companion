import { PrismaClient, TimelineEventType as PrismaTimelineEventType } from "@prisma/client";
import { TimelineEvent } from "../../../domain/timeline/timeline-event.entity";
import { TimelineEventRepository } from "../../../domain/timeline/timeline-event.repository";
import { TimelineEventType } from "../../../domain/timeline/timeline-event-type";

const toDomainType = (value: PrismaTimelineEventType): TimelineEventType =>
  value === "FIRST_CONVERSATION" ? "first_conversation" : "relationship_level_up";

const toPrismaType = (value: TimelineEventType): PrismaTimelineEventType =>
  value === "first_conversation" ? "FIRST_CONVERSATION" : "RELATIONSHIP_LEVEL_UP";

export class PrismaTimelineEventRepository implements TimelineEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(event: TimelineEvent): Promise<void> {
    await this.prisma.timelineEvent.create({
      data: {
        id: event.id,
        companionId: event.companionId,
        eventType: toPrismaType(event.eventType),
        description: event.description,
        createdAt: event.createdAt,
      },
    });
  }

  async findByCompanionId(companionId: string, limit: number): Promise<TimelineEvent[]> {
    const records = await this.prisma.timelineEvent.findMany({
      where: { companionId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((r) =>
      TimelineEvent.create({
        id: r.id,
        companionId: r.companionId,
        eventType: toDomainType(r.eventType),
        description: r.description,
        createdAt: r.createdAt,
      }),
    );
  }

  async hasEventOfType(companionId: string, eventType: TimelineEventType): Promise<boolean> {
    const count = await this.prisma.timelineEvent.count({
      where: { companionId, eventType: toPrismaType(eventType) },
    });
    return count > 0;
  }
}
