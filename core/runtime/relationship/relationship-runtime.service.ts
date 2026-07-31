import { randomUUID } from "crypto";
import { RelationshipRepository } from "../../domain/relationship/relationship.repository";
import { Relationship } from "../../domain/relationship/relationship.entity";
import { RelationshipScorer } from "./relationship-scorer.service";
import { Logger } from "../../shared/logger/logger";
import { ProcessExchangeResult } from "./relationship-runtime.dto";

// Relationship Runtime — orkestrator: cari/buat Relationship, hitung poin
// dari satu pertukaran pesan, simpan, dan beri tahu caller apakah level
// BARU SAJA naik (dipakai Timeline Runtime di patch 3 untuk mencatat
// milestone otomatis).
export class RelationshipRuntime {
  constructor(
    private readonly relationshipRepository: RelationshipRepository,
    private readonly scorer: RelationshipScorer,
    private readonly logger: Logger,
  ) {}

  async processExchange(companionId: string, userMessage: string): Promise<ProcessExchangeResult> {
    const relationship = await this.getOrCreate(companionId);
    const points = this.scorer.scoreExchange(userMessage);
    const leveledUp = relationship.addPoints(points);

    await this.relationshipRepository.save(relationship);

    if (leveledUp) {
      this.logger.info("Relationship level naik!", {
        companionId,
        newLevel: relationship.level,
        affectionPoints: relationship.affectionPoints,
      });
    }

    return { relationship, leveledUp };
  }

  async getCurrent(companionId: string): Promise<Relationship> {
    return this.getOrCreate(companionId);
  }

  private async getOrCreate(companionId: string): Promise<Relationship> {
    const existing = await this.relationshipRepository.findByCompanionId(companionId);
    if (existing) return existing;

    const relationship = Relationship.create({ id: randomUUID(), companionId });
    await this.relationshipRepository.save(relationship);
    return relationship;
  }
}
