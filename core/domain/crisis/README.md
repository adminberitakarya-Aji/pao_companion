# domain/crisis (Phase 4 — P4-4)

Entity `CrisisEvent` — catatan tiap kali `CrisisDetector`
(`core/runtime/crisis`) mendeteksi indikasi distress/krisis pada pesan user.

Ini SENGAJA dipisah dari `domain/moderation` walau bentuknya mirip: krisis
bukan "pelanggaran kebijakan" yang ditolak, tapi sinyal bahwa user butuh
bantuan — responsnya bukan blokir, tapi pesan aman + arahan bantuan
profesional (lihat `core/runtime/crisis/crisis-response.ts`).
