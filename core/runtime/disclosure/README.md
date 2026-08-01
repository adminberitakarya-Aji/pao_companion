# runtime/disclosure (Phase 4 — P4-2)

Dua kanal AI disclosure:

1. **Onboarding** — `AI_DISCLOSURE_ONBOARDING_MESSAGE_ID` ditampilkan di
   `apps/web` sebelum chat pertama; user meng-ack via
   `AcknowledgeAiDisclosureUseCase` (`core/application/use-cases/user`),
   dicatat sebagai `User.aiDisclosureAckedAt`.
2. **Berkala** — `AiDisclosureReminder.shouldRemind()` dipanggil tiap
   giliran percakapan oleh `ConversationRuntime`; tiap 50 balasan
   companion, `HandleUserMessageResult.aiDisclosureReminder` diisi supaya
   UI bisa tampilkan sebagai system banner (BUKAN dicampur ke teks
   balasan companion — supaya jelas ini pesan sistem, bukan companion
   "keluar dari karakter").
