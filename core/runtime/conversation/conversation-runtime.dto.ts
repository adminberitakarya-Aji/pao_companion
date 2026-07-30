export interface HandleUserMessageInput {
  companionId: string;
  userMessage: string;
}

export interface HandleUserMessageResult {
  conversationId: string;
  reply: string;
  providerId: string;
}
