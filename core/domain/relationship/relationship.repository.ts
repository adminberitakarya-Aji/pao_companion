import { Relationship } from "./relationship.entity";

export interface RelationshipRepository {
  findByCompanionId(companionId: string): Promise<Relationship | null>;
  save(relationship: Relationship): Promise<void>;
}

export const RELATIONSHIP_REPOSITORY = Symbol("RELATIONSHIP_REPOSITORY");
