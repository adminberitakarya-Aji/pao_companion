import { randomUUID } from "crypto";
import { TimelineEventRepository } from "../../domain/timeline/timeline-event.repository";
import { TimelineEvent } from "../../domain/timeline/timeline-event.entity";
import { RelationshipLevel, LEVEL_LABELS } from "../../domain/relationship/relationship-level";
import { Logger } from "../../shared/logger/logger";

// Timeline Runtime — mencatat milestone hubungan. TIDAK menentukan SENDIRI
// kapan milestone terjadi — itu keputusan caller (Conversation Runtime di
// patch 5), berdasarkan sinyal dari Relationship Runtime (leveledUp) atau
// kondisi lain (mis. pesan pertama).
export class TimelineRuntime {
  constructor(
    private readonly timelineEventRepository: TimelineEventRepository,
    private readonly logger: Logger,
  ) {}

  // Dipanggil tiap kali ada percakapan — TAPI event cuma tercatat SEKALI
  // (dicek lewat hasEventOfType). Return null kalau sudah pernah tercatat
  // sebelumnya (bukan error, cuma "tidak ada yang baru").
  async recordFirstConversationIfNeeded(companionId: string): Promise<TimelineEvent | null> {
    const alreadyExists = await this.timelineEventRepository.hasEventOfType(
      companionId,
      "first_conversation",
    );
    if (alreadyExists) return null;

    const event = TimelineEvent.create({
      id: randomUUID(),
      companionId,
      eventType: "first_conversation",
      description: "Percakapan pertama dimulai",
    });
    await this.timelineEventRepository.save(event);
    this.logger.info("Milestone tercatat: percakapan pertama", { companionId });
    return event;
  }

  // Dipanggil saat Relationship Runtime melaporkan leveledUp = true.
  // Event ini BOLEH berulang (tiap kali naik level, bukan cuma sekali).
  async recordLevelUp(companionId: string, newLevel: RelationshipLevel): Promise<TimelineEvent> {
    const label = LEVEL_LABELS[newLevel];
    const event = TimelineEvent.create({
      id: randomUUID(),
      companionId,
      eventType: "relationship_level_up",
      description: `Hubungan naik ke Level ${newLevel}: ${label}`,
    });
    await this.timelineEventRepository.save(event);
    this.logger.info("Milestone tercatat: level up", { companionId, newLevel, label });
    return event;
  }

  async getRecentEvents(companionId: string, limit: number = 20): Promise<TimelineEvent[]> {
    return this.timelineEventRepository.findByCompanionId(companionId, limit);
  }
}
