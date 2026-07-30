import { Conversation } from "./conversation.entity";

export interface ConversationRepository {
  findByCompanionId(companionId: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
}

export const CONVERSATION_REPOSITORY = Symbol("CONVERSATION_REPOSITORY");
