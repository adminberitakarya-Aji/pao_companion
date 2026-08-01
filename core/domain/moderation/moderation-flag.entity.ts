import { ModerationCategory } from "./moderation-category";
import { ModerationAction, ModerationSource } from "./moderation-action";

const SNIPPET_MAX_LENGTH = 200;

export interface ModerationFlagProps {
  id: string;
  companionId: string;
  conversationId?: string | null;
  messageId?: string | null;
  source: ModerationSource;
  category: ModerationCategory;
  action: ModerationAction;
  matchedTerm: string;
  content: string; // isi pesan LENGKAP — entity yang memotong jadi snippet, caller tidak perlu mikirin privasi
  createdAt?: Date;
}

// ModerationFlag — catatan audit tiap kali Content Moderator menemukan
// pelanggaran. Immutable, sama seperti TimelineEvent — ini adalah log,
// bukan sesuatu yang diedit setelah tercatat.
//
// SENGAJA cuma menyimpan snippet (dipotong) dari konten, bukan pesan utuh
// — cukup untuk keperluan review/audit tanpa menyimpan duplikat penuh dari
// data yang sudah (atau justru TIDAK) ada di tabel messages.
export class ModerationFlag {
  private constructor(
    public readonly id: string,
    public readonly companionId: string,
    public readonly conversationId: string | null,
    public readonly messageId: string | null,
    public readonly source: ModerationSource,
    public readonly category: ModerationCategory,
    public readonly action: ModerationAction,
    public readonly matchedTerm: string,
    public readonly contentSnippet: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: ModerationFlagProps): ModerationFlag {
    const snippet =
      props.content.length > SNIPPET_MAX_LENGTH
        ? `${props.content.slice(0, SNIPPET_MAX_LENGTH)}…`
        : props.content;

    return new ModerationFlag(
      props.id,
      props.companionId,
      props.conversationId ?? null,
      props.messageId ?? null,
      props.source,
      props.category,
      props.action,
      props.matchedTerm,
      snippet,
      props.createdAt ?? new Date(),
    );
  }
}
