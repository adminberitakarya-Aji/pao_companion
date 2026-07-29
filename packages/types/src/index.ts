// Shared types antara apps/web, apps/mobile, apps/api.
// TODO Phase 2: tambah tipe Conversation, Message, dsb.

export type ApiHealthResponse = {
  status: "ok" | "error";
  service: string;
  timestamp: string;
};
