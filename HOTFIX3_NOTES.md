# Hotfix 3 — Perbaikan Memory Extraction Gagal (Gemini/Claude "contents kosong") — Catatan Penerapan

Perbaikan bug dari saya, ditemukan dari hasil audit menyeluruh Phase 0-3
Anda. Extract menimpa folder `pao-companion`.

## Akar masalah

`pnpm test:memory` dan `pnpm test:full-conversation` gagal ekstrak fakta
dengan error:
```
Gemini API error (400): {"error":{"code":400,"message":"* GenerateContentRequest.contents: contents is not specified","status":"INVALID_ARGUMENT"}}
```

`MemoryExtractor` (Phase 3 patch 1) mengirim **cuma 1 pesan** dengan
`role: "system"` (prompt ekstraksi) — beda dari chat biasa yang selalu
punya minimal 1 pesan `role: "user"`. Di `GeminiFlashProvider`, pesan
`role: "system"` dipindah ke field terpisah (`systemInstruction`), BUKAN
masuk ke array `contents`. Kalau SEMUA pesan input cuma system, `contents`
jadi array kosong — dan Gemini API menolak request dengan `contents` kosong.

## Perbaikan

Di kedua provider (`GeminiFlashProvider` dan `ClaudeSonnetProvider`):
kalau setelah memisahkan system prompt ternyata `contents`/`messages` jadi
kosong, masukkan system prompt tadi sebagai satu turn `user` tunggal —
supaya request tetap valid ke API manapun.

Diperbaiki di KEDUA provider (bukan cuma Gemini) karena pola "kirim cuma
system prompt untuk tugas satu-arah" (ekstraksi, klasifikasi, dll — bukan
chat dua-arah) akan dipakai lagi di Phase 4 (content moderation) dan
kemungkinan tempat lain nanti.

## Cara extract & verifikasi

```bash
# Stop pnpm dev dulu (Ctrl+C), lalu extract ZIP ini menimpa folder pao-companion
pnpm install    # tidak ada dependency baru, tapi aman dijalankan
```

Tidak ada perubahan schema — tidak perlu migration.

**Verifikasi — jalankan ulang 2 test yang tadi gagal:**

```bash
pnpm test:memory -- "Aku suka kopi dan kerja sebagai developer" "Wah keren!" aji@pao.test
```
✅ Harus SEKARANG berhasil ekstrak fakta (bukan lagi "Memory extraction gagal")

```bash
pnpm test:full-conversation -- aji@pao.test "Btw hari ini aku ada meeting penting lagi"
```
✅ Bagian "Memory yang tersimpan sejauh ini" harus mulai bertambah (bukan 0 terus)

Tempel hasilnya — kalau kedua ini sudah berhasil, **seluruh Phase 0-3
benar-benar solid** dan kita bisa lanjut ke Phase 4 dengan percaya diri.

## Catatan tambahan (bukan bug, cuma observasi)

Balasan chat di Phase 2 test Anda ("Halo Aji! Walah, kenalannya sampai
di-double gitu,") terlihat terpotong di tampilan PowerShell — ini
**kemungkinan besar cuma pembatasan lebar tampilan tabel `Invoke-RestMethod`
di console**, bukan bug di API. Kalau mau lihat balasan lengkap tanpa
terpotong, coba:
```powershell
(Invoke-RestMethod -Uri http://localhost:3001/conversations/messages -Headers $headers)[0].content
```
atau convert ke JSON dulu: `... | ConvertTo-Json`.
