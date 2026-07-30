export interface ConversationProps {
  id: string;
  companionId: string;
  createdAt?: Date;
}

// Conversation sengaja "tipis" — cuma pembungkus/thread ID untuk
// mengelompokkan Message. Satu Companion punya SATU Conversation yang
// terus tumbuh (bukan multi-thread terpisah), konsisten dengan pola
// companion app pada umumnya (satu riwayat percakapan berkelanjutan).
export class Conversation {
  private constructor(
    public readonly id: string,
    public readonly companionId: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: ConversationProps): Conversation {
    return new Conversation(
      props.id,
      props.companionId,
      props.createdAt ?? new Date(),
    );
  }
}
