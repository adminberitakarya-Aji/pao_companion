import { TimelineEvent } from "./timeline-event.entity";
import { TimelineEventType } from "./timeline-event-type";

export interface TimelineEventRepository {
  save(event: TimelineEvent): Promise<void>;
  findByCompanionId(companionId: string, limit: number): Promise<TimelineEvent[]>;
  // Dipakai untuk cegah duplikat milestone yang seharusnya cuma terjadi
  // SEKALI (mis. "first_conversation") — event type lain seperti
  // "relationship_level_up" boleh berulang (tiap kali naik level).
  hasEventOfType(companionId: string, eventType: TimelineEventType): Promise<boolean>;
}

export const TIMELINE_EVENT_REPOSITORY = Symbol("TIMELINE_EVENT_REPOSITORY");
