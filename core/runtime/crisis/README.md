# runtime/crisis (Phase 4 — P4-4)

`CrisisDetector.detect(text)` — keyword match (ID/EN) untuk pesan user,
dipanggil dari `ConversationRuntime` SEBELUM provider LLM dipanggil.

Kalau terdeteksi:
1. Provider LLM **tidak dipanggil** untuk giliran ini — balasan companion
   diganti `CRISIS_SAFE_RESPONSE_ID` (`crisis-response.ts`), berisi kontak
   bantuan profesional terverifikasi (SEJIWA/Healing119 119 ext. 8, per
   Kemenkes RI).
2. Pesan user & safe-response tetap disimpan seperti biasa (supaya
   riwayat percakapan tidak hilang/janggal).
3. `CrisisEvent` (`domain/crisis`) dicatat untuk audit — TIDAK untuk
   profiling user, semata untuk memastikan pola ini bisa direview manusia.
4. Relationship/Timeline/Memory processing untuk giliran ini DI-SKIP —
   momen krisis bukan momen untuk "naik level hubungan" atau ekstraksi
   memory biasa.

Nomor bantuan WAJIB diverifikasi ulang secara berkala — nomor hotline
kesehatan jiwa di Indonesia beberapa kali berganti/nonaktif. Jangan
copy-paste nomor dari sumber lama tanpa verifikasi ke sumber Kemenkes RI.
