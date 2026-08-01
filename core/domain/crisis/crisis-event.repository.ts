import { CrisisEvent } from "./crisis-event.entity";

export interface CrisisEventRepository {
  save(event: CrisisEvent): Promise<void>;
  findByCompanionId(companionId: string, limit: number): Promise<CrisisEvent[]>;
}

export const CRISIS_EVENT_REPOSITORY = Symbol("CRISIS_EVENT_REPOSITORY");
