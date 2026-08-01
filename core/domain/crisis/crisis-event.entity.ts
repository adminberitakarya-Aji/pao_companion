const SNIPPET_MAX_LENGTH = 200;

export interface CrisisEventProps {
  id: string;
  companionId: string;
  conversationId: string;
  keyword: string;
  content: string; // pesan user LENGKAP — entity yang memotong jadi snippet
  createdAt?: Date;
}

// CrisisEvent — catatan tiap kali CrisisDetector mendeteksi indikasi
// distress/krisis (ide bunuh diri, menyakiti diri, dsb.) pada pesan user,
// dan sistem merespons dengan safe-response alih-alih balasan companion
// normal. Dipakai untuk audit & (di masa depan) eskalasi ke manusia —
// BUKAN untuk profiling/pelabelan user.
export class CrisisEvent {
  private constructor(
    public readonly id: string,
    public readonly companionId: string,
    public readonly conversationId: string,
    public readonly keyword: string,
    public readonly messageSnippet: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: CrisisEventProps): CrisisEvent {
    const snippet =
      props.content.length > SNIPPET_MAX_LENGTH
        ? `${props.content.slice(0, SNIPPET_MAX_LENGTH)}…`
        : props.content;

    return new CrisisEvent(
      props.id,
      props.companionId,
      props.conversationId,
      props.keyword,
      snippet,
      props.createdAt ?? new Date(),
    );
  }
}
