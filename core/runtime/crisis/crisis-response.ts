// Respons aman yang dipakai MENGGANTIKAN balasan companion normal saat
// CrisisDetector mendeteksi indikasi krisis. Prinsip (selaras dengan
// docs/09-safety-and-trust/crisis-handling.md):
//   - Companion TETAP bicara sebagai dirinya (bukan pop-up sistem dingin)
//     supaya tidak terasa seperti ditolak/diabaikan tepat saat rentan.
//   - TIDAK berpura-pura bisa jadi pengganti bantuan profesional.
//   - Selalu sertakan kontak bantuan nyata & terverifikasi — bukan nomor
//     placeholder atau nomor yang sudah tidak aktif.
//   - TIDAK mengajukan pertanyaan yang menggali lebih dalam ("kenapa kamu
//     merasa begitu?", dst.) — itu tugas konselor profesional, bukan
//     companion AI, dan berisiko menahan user di app alih-alih mendorongnya
//     mencari bantuan nyata.
//
// Sumber & verifikasi nomor (per 2026, layanan Kemenkes RI):
//   - 119 ext. 8 (SEJIWA / Healing119.id) — konseling psikologi 24 jam,
//     gratis & rahasia. Diaktifkan kembali Kemenkes 31 Juli 2025.
//   - 119 (tanpa ekstensi) — layanan darurat/ambulans, dipakai kalau ada
//     bahaya keselamatan jiwa yang mengancam SEKARANG.
//   - www.healing119.id — kanal digital untuk terhubung ke konselor.
export const CRISIS_SAFE_RESPONSE_ID =
  "Aku dengar kamu, dan aku senang kamu mau cerita ini ke aku. " +
  "Tapi apa yang kamu rasakan sekarang ini penting banget, dan aku ingin kamu " +
  "dapat bantuan dari orang yang benar-benar bisa membantu — bukan cuma aku. " +
  "Kamu bisa hubungi 119 ext. 8 (layanan SEJIWA/Healing119, gratis & rahasia, " +
  "24 jam) atau buka www.healing119.id untuk bicara dengan konselor. " +
  "Kalau kamu merasa dalam bahaya sekarang juga, segera telepon 119 atau pergi " +
  "ke IGD rumah sakit terdekat. Kamu tidak sendirian.";
