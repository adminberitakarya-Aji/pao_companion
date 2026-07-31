import { PrismaClient } from "@prisma/client";
import { Relationship } from "../../../domain/relationship/relationship.entity";
import { RelationshipRepository } from "../../../domain/relationship/relationship.repository";

export class PrismaRelationshipRepository implements RelationshipRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCompanionId(companionId: string): Promise<Relationship | null> {
    const record = await this.prisma.relationship.findUnique({ where: { companionId } });
    if (!record) return null;
    return Relationship.create({
      id: record.id,
      companionId: record.companionId,
      affectionPoints: record.affectionPoints,
      createdAt: record.createdAt,
    });
  }

  async save(relationship: Relationship): Promise<void> {
    await this.prisma.relationship.upsert({
      where: { id: relationship.id },
      create: {
        id: relationship.id,
        companionId: relationship.companionId,
        affectionPoints: relationship.affectionPoints,
      },
      update: {
        affectionPoints: relationship.affectionPoints,
      },
    });
  }
}
