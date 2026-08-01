# runtime/moderation (Phase 4 — P4-1)

`ContentModerator.evaluate(text)` — rule engine berbasis regex
(`moderation-rules.ts`), dipanggil dari `ConversationRuntime` untuk:

1. Pesan USER, SEBELUM disimpan ke database. `action: "block"` →
   `BlockedContentError` dilempar, pesan TIDAK disimpan, provider LLM
   TIDAK dipanggil.
2. Balasan COMPANION, SEBELUM disimpan/dikembalikan ke user. Provider
   pihak ketiga bisa saja menghasilkan output bermasalah walau input
   aman — balasan yang ter-block diganti fallback safe-message, bukan
   ditampilkan.

Setiap match (`block` maupun `flag`) dicatat sebagai `ModerationFlag`
(`domain/moderation`) lewat `ModerationFlagRepository` untuk audit.

Ini rule engine V1 — cukup untuk kasus jelas, TIDAK menggantikan
moderation API pihak ketiga yang lebih robust untuk kasus samar. Lihat
catatan TODO di `moderation-rules.ts` sebelum rilis publik (Phase 6).
