import { Relationship } from "../../domain/relationship/relationship.entity";

export interface ProcessExchangeResult {
  relationship: Relationship;
  leveledUp: boolean;
}
