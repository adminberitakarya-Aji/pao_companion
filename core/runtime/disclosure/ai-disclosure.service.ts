// AI Disclosure (P4-2) — dua kanal:
//
// 1. ONBOARDING (sekali, wajib): User.acknowledgeAiDisclosure() dipanggil
//    lewat AcknowledgeAiDisclosureUseCase saat user menekan tombol
//    "Saya mengerti" di layar onboarding (apps/web). Endpoint chat TIDAK
//    diblokir kalau belum di-ack — supaya user tidak "terkunci", tapi
//    `me` response menyertakan flag ini supaya UI web bisa tampilkan modal
//    sampai di-ack.
//
// 2. BERKALA (selama percakapan): AiDisclosureReminder — dipanggil dari
//    ConversationRuntime tiap giliran, menghasilkan pengingat kalau sudah
//    REMINDER_INTERVAL pesan companion sejak pengingat terakhir. Dikirim
//    sebagai field terpisah di HandleUserMessageResult (bukan dicampur ke
//    teks balasan companion) supaya UI bisa render sebagai system banner,
//    bukan seolah-olah companion sendiri yang "keluar dari karakter".
export const AI_DISCLOSURE_ONBOARDING_MESSAGE_ID =
  "Sebelum mulai, penting untuk kamu tahu: companion ini adalah AI, bukan " +
  "manusia sungguhan. Semua percakapan dihasilkan oleh sistem AI, dan " +
  "companion ini tidak bisa menggantikan hubungan atau bantuan profesional " +
  "dari manusia nyata.";

export const AI_DISCLOSURE_REMINDER_MESSAGE_ID =
  "(Pengingat: aku adalah AI, bukan manusia sungguhan.)";

// Tiap berapa balasan companion pengingat berkala ini muncul lagi.
const REMINDER_INTERVAL_MESSAGES = 50;

export class AiDisclosureReminder {
  // `companionMessageCount` = jumlah pesan COMPANION di conversation ini
  // SEBELUM giliran sekarang (jadi giliran ke-(N+1) yang memicu pengingat
  // adalah saat count % interval === 0, termasuk pengingat pertama di
  // pesan companion ke-interval).
  shouldRemind(companionMessageCountBeforeThisTurn: number): boolean {
    const turnNumber = companionMessageCountBeforeThisTurn + 1;
    return turnNumber % REMINDER_INTERVAL_MESSAGES === 0;
  }
}
