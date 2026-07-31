import { TimelineEventType } from "./timeline-event-type";
import { EmptyTimelineDescriptionError } from "./timeline-event.errors";

export interface TimelineEventProps {
  id: string;
  companionId: string;
  eventType: TimelineEventType;
  description: string;
  createdAt?: Date;
}

// TimelineEvent — catatan satu momen penting dalam hubungan. Immutable
// setelah dibuat (tidak ada method untuk mengubah isinya) — milestone
// yang sudah tercatat tidak seharusnya diedit, cuma dibaca sebagai riwayat.
export class TimelineEvent {
  private constructor(
    public readonly id: string,
    public readonly companionId: string,
    public readonly eventType: TimelineEventType,
    public readonly description: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: TimelineEventProps): TimelineEvent {
    const trimmed = props.description.trim();
    if (trimmed.length === 0) {
      throw new EmptyTimelineDescriptionError();
    }
    return new TimelineEvent(
      props.id,
      props.companionId,
      props.eventType,
      trimmed,
      props.createdAt ?? new Date(),
    );
  }
}
