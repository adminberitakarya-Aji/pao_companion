import { ModerationFlag } from "./moderation-flag.entity";

export interface ModerationFlagRepository {
  save(flag: ModerationFlag): Promise<void>;
  findByCompanionId(companionId: string, limit: number): Promise<ModerationFlag[]>;
}

export const MODERATION_FLAG_REPOSITORY = Symbol("MODERATION_FLAG_REPOSITORY");
