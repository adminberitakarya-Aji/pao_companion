import { MessageRole } from "./message-role";
import { EmptyMessageError, MessageTooLongError } from "./conversation.errors";

const MAX_MESSAGE_LENGTH = 4000;

export interface MessageProps {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt?: Date;
}

// Message adalah entity independen (BUKAN bagian dari aggregate Conversation)
// meski secara konsep "milik" satu conversation. Alasan: riwayat pesan bisa
// sangat banyak (ratusan/ribuan per companion) — kalau jadi bagian aggregate
// Conversation, setiap load Conversation akan menyeret seluruh history ke
// memory, boros dan lambat. Message punya repository sendiri dengan
// pagination (lihat message.repository.ts).
export class Message {
  private constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: MessageProps): Message {
    const trimmed = props.content.trim();
    if (trimmed.length === 0) {
      throw new EmptyMessageError();
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw new MessageTooLongError(
        `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter`,
      );
    }
    return new Message(
      props.id,
      props.conversationId,
      props.role,
      trimmed,
      props.createdAt ?? new Date(),
    );
  }
}
