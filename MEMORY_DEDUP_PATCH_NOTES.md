# Patch Tambahan — Dedup Memory (2 Lapis) — Catatan Penerapan

Perbaikan kecil sebelum lanjut Phase 4, menindaklanjuti temuan duplikat
"Nama User adalah Aji" / "Nama user adalah Aji" dari audit Anda.

## Yang diperbaiki

**Lapis 1 — LLM-aware (di `MemoryExtractor`)**: sebelum ekstraksi, kirim
daftar fakta yang SUDAH tersimpan (maks 30 terbaru) ke prompt, dengan
instruksi eksplisit "jangan ulangi ini walau ditulis beda kata". Ini
menangani kasus seperti "User suka ngopi" vs "User suka minum kopi" —
beda kata, sama makna — yang tidak bisa ditangkap exact-match string biasa.

**Lapis 2 — exact-match (di `MemoryRuntime`)**: jaring pengaman murah,
setelah normalisasi (lowercase + trim + rapikan spasi), cek apakah fakta
baru PERSIS sama dengan yang sudah ada. Ini yang langsung menangkap kasus
"Nama User adalah Aji" vs "Nama user adalah Aji" (cuma beda kapitalisasi)
kalau lapis 1 entah kenapa terlewat.

**Kenapa 2 lapis, bukan 1 saja?** LLM tidak selalu 100% patuh instruksi
(kadang tetap menghasilkan sesuatu yang mirip meski sudah dikasih tahu) —
jadi exact-match jadi jaring pengaman murah (tanpa panggilan API tambahan)
untuk kasus paling jelas, sementara LLM-aware menangani variasi kata yang
lebih halus.

## File yang diubah
- `core/runtime/memory/memory-extractor.service.ts` — terima `existingMemories`, masukkan ke prompt
- `core/runtime/memory/memory-runtime.service.ts` — fetch existing memories, kirim ke extractor, exact-match check sebelum simpan

**Tidak ada perubahan** di `ConversationRuntime`, `apps/api`, atau schema
Prisma — `MemoryRuntime.processExchange()` tetap dipanggil dengan cara
yang sama persis, cuma perilaku internalnya yang lebih pintar sekarang.

## Cara extract & verifikasi

```bash
pnpm install    # tidak ada dependency baru, tapi aman dijalankan
```
Tidak ada migration.

**Verifikasi — coba sebutkan fakta yang SAMA lagi (nama Aji), harusnya TIDAK tersimpan dobel lagi:**
```bash
pnpm test:memory -- "Btw namaku Aji, seperti yang udah kubilang" "Iya aku inget kok, Aji!" aji@pao.test
```
Perhatikan log — harus muncul:
```
[MemoryTest] Fakta duplikat dilewati (sudah tersimpan sebelumnya) { ... fact: "..." }
```
(atau kalau LLM extraction sudah pintar duluan di lapis 1, mungkin tidak
menghasilkan fakta itu sama sekali — sama-sama tandanya berhasil)

Cek juga `pnpm db:studio` — tabel `memories` untuk companion "Aya" harusnya
TIDAK bertambah dari entry "nama Aji" yang sudah ada, walau Anda sebut lagi.

## Catatan jujur — ini belum sempurna

Dedup ini menangani kasus yang paling umum (pengulangan fakta yang sama),
tapi bukan solusi lengkap untuk semua skenario (mis. fakta yang saling
bertentangan seiring waktu — "User kerja di Semarang" lalu belakangan
"User pindah kerja ke Jakarta" — sistem ini belum tahu cara update/
menggantikan fakta lama, cuma mencegah DUPLIKASI persis/mirip). Penanganan
fakta yang berubah seiring waktu adalah peningkatan lebih lanjut yang bisa
dikerjakan nanti kalau dibutuhkan — tidak saya kerjakan sekarang supaya
tetap fokus pada masalah yang benar-benar ditemukan di audit.

Setelah ini terverifikasi, kita lanjut ke **Phase 4 — Safety & Trust**.
