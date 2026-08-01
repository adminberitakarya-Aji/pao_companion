# Crisis Handling

Status: **diimplementasikan** — lihat `core/domain/crisis/` &
`core/runtime/crisis/` (P4-4).

## Prinsip

Ide/perasaan distress (ingin mengakhiri hidup, ingin menyakiti diri, dst.)
BUKAN "pelanggaran kebijakan konten" yang ditolak — itu sinyal bahwa user
butuh bantuan nyata. Responsnya harus:

- Suportif, bukan menghakimi atau mengabaikan.
- TIDAK berpura-pura companion AI bisa jadi pengganti bantuan profesional.
- Selalu menyertakan kontak bantuan nyata & **terverifikasi aktif**.
- TIDAK menggali lebih dalam ("kenapa kamu merasa begitu?", dst.) — itu
  tugas konselor profesional, bukan companion AI; pertanyaan probing
  berisiko menahan user di dalam app alih-alih mendorongnya mencari
  bantuan nyata sesegera mungkin.

## Implementasi

1. `CrisisDetector.detect()` (`core/runtime/crisis`) — keyword match
   bilingual ID/EN pada tiap pesan user, dipanggil SEBELUM provider LLM
   dipanggil sama sekali.
2. Kalau terdeteksi: provider LLM **di-skip total** untuk giliran ini.
   Balasan companion diganti `CRISIS_SAFE_RESPONSE_ID` — respons tetap
   dari "suara" companion (bukan pop-up sistem dingin), tapi isinya
   mengarahkan ke bantuan profesional.
3. Relationship/Timeline/Memory processing untuk giliran ini di-skip —
   momen krisis bukan momen untuk "naik level hubungan" atau ekstraksi
   memory biasa.
4. `CrisisEvent` dicatat untuk audit (snippet saja) — bukan untuk
   profiling user, semata supaya pola ini bisa direview manusia & respons
   terus ditingkatkan.

## Kontak bantuan yang dipakai (per 2026)

- **119 ext. 8** (layanan SEJIWA / Healing119.id) — konseling psikologi
  24 jam, gratis & rahasia. Diaktifkan kembali Kementerian Kesehatan RI
  31 Juli 2025, bekerja sama dengan Ikatan Psikolog Klinis Indonesia.
- **www.healing119.id** — kanal digital untuk terhubung ke konselor.
- **119** (tanpa ekstensi) — layanan darurat/ambulans, untuk situasi yang
  mengancam keselamatan jiwa SAAT INI.

**PENTING**: nomor hotline kesehatan jiwa di Indonesia beberapa kali
berganti/nonaktif (hotline lama `1-500-454` sudah ditutup sejak 2014).
Verifikasi ulang nomor ini secara berkala ke sumber resmi Kementerian
Kesehatan RI — jangan biarkan aplikasi mengarahkan user dalam krisis ke
nomor yang sudah tidak aktif.

## Keterbatasan V1

Keyword-based detection SENGAJA dibuat sensitif (rather-safe-than-sorry):
false positive (user dapat pesan suportif padahal cuma bercanda/lirik
lagu, dst.) dianggap jauh lebih aman daripada false negative. Ini bisa
terasa mengganggu di kasus tertentu — trade-off yang disengaja untuk
Phase 4. Evaluasi classifier yang lebih presisi bisa jadi peningkatan di
fase berikutnya, TAPI jangan pernah menurunkan sensitivitas hanya demi
mengurangi false positive tanpa mempertimbangkan risiko keselamatan.
