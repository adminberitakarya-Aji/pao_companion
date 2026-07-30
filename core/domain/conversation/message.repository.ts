import { Message } from "./message.entity";

export interface RecentMessagesQuery {
  conversationId: string;
  limit: number;   // dipakai Context Runtime (Phase 2 patch 2) untuk batasi history yang di-inject ke prompt
}

export interface MessageRepository {
  save(message: Message): Promise<void>;
  // Ambil N pesan TERBARU, urutan hasil tetap kronologis (lama -> baru) —
  // supaya siap langsung dipakai sebagai "history" di prompt.
  findRecent(query: RecentMessagesQuery): Promise<Message[]>;
}

export const MESSAGE_REPOSITORY = Symbol("MESSAGE_REPOSITORY");
