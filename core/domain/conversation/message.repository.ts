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
  // BARU Phase 4 (P4-2) — jumlah pesan role=companion di satu conversation,
  // dipakai AiDisclosureReminder untuk menentukan kapan pengingat berkala
  // muncul lagi. TIDAK pakai findRecent+filter supaya tidak perlu tarik
  // seluruh history cuma untuk hitung jumlah.
  countCompanionMessages(conversationId: string): Promise<number>;
}

export const MESSAGE_REPOSITORY = Symbol("MESSAGE_REPOSITORY");
