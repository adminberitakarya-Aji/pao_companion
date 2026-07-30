# Hotfix 1 — Perbaikan Error Compile `apps/api` — Catatan Penerapan

Ini **perbaikan bug dari saya**, bukan patch fitur baru. Extract menimpa
folder `pao-companion` yang sudah ada, di atas semua patch sebelumnya.

## Akar masalah (kenapa `/auth/register` dan `/health` sama-sama 404)

`apps/api` gagal compile (9 error TypeScript) sejak awal, sehingga NestJS
tidak pernah benar-benar start. Karena `apps/web` (Next.js) juga defaultnya
jalan di port 3000, begitu `apps/api` gagal bind ke port itu, Next.js yang
akhirnya "menguasai" port 3000 — jadi semua request (termasuk ke
`/auth/register`) dijawab 404 oleh Next.js, bukan oleh API.

## 3 penyebab & perbaikannya

**1. `strictPropertyInitialization` (bagian dari `strict: true`) menolak DTO**
Pola umum di NestJS+class-validator adalah properti tanpa nilai awal
(`email: string;`) karena nilainya diisi runtime oleh `ValidationPipe`,
bukan di constructor. TypeScript strict mode menganggap ini error. Perbaikan:
tambah tanda `!` (definite assignment assertion) → `email!: string;`.
Diperbaiki di: `login.dto.ts`, `register.dto.ts`, `create-companion.dto.ts`.

**2. Import tidak terpakai di `companion.entity.ts`**
`CharacterProps` di-import tapi tidak pernah dipakai — kena `noUnusedLocals`.
Perbaikan: hapus dari import statement.

**3. `bcrypt` "Cannot find module ... or its corresponding type declarations"**
Ini yang paling penting untuk dipahami — **bukan sekadar typo, tapi masalah
arsitektur monorepo** yang akan terulang kalau tidak diantisipasi:

`core/` (tempat `bcrypt-password-hasher.ts` berada) BUKAN package workspace
sendiri — dia cuma kumpulan file yang di-import lewat relative path ke
dalam `apps/api`. Dependency `bcrypt` cuma terdaftar di
`apps/api/package.json`. Saat TypeScript compiler menelusuri file
`core/infrastructure/security/bcrypt-password-hasher.ts` (yang secara fisik
ada DI LUAR folder `apps/api`), Node module resolution mencari `node_modules`
mulai dari lokasi file itu sendiri (`core/infrastructure/security/`) ke atas
— TIDAK otomatis "meminjam" `node_modules` milik `apps/api`.

**Perbaikan**: `bcrypt` dan `@types/bcrypt` saya pindahkan (tambahkan) ke
root `package.json`, supaya ter-install di `node_modules` root — yang
otomatis terjangkau dari `core/` manapun (karena Node mencari ke atas
sampai ke root).

## ⚠️ Aturan penting untuk ke depan (supaya tidak terulang)

**Setiap kali kode di `core/` butuh package npm baru (misal nanti SDK
fal.ai, BullMQ, dll), package itu HARUS ditambahkan ke root
`package.json`** — bukan cukup di `apps/api/package.json` saja. Ini
konsekuensi dari keputusan awal membuat `core/` sebagai folder biasa
(bukan package workspace terpisah). Kalau masalah ini mulai terasa
merepotkan seiring bertambah banyak dependency, kita bisa pertimbangkan
menjadikan `core/` sebagai package workspace sendiri (`@pao/core`) di fase
selanjutnya — tapi untuk sekarang, aturan "tambahkan ke root juga" cukup.

## Cara extract & setup

```bash
pnpm install     # WAJIB — untuk install bcrypt di root node_modules
```

Tidak perlu `db:generate`/`db:migrate` — tidak ada perubahan schema.

## Cara verifikasi

1. **Stop** `pnpm dev` yang sedang jalan (Ctrl+C), lalu jalankan ulang:
   ```bash
   pnpm dev
   ```
2. Perhatikan output `@pao/api:dev` — seharusnya SEKARANG muncul:
   ```
   Found 0 errors. Watching for file changes.
   [api] listening on http://localhost:3000
   ```
   (bukan lagi "Found 9 errors")

3. Tes ulang:
   ```powershell
   Invoke-RestMethod -Uri http://localhost:3000/health
   ```
   Harus dapat `{"status":"ok",...}` — INI konfirmasi API benar-benar jalan.

4. Baru lanjut register/buat companion seperti instruksi sebelumnya.

Kalau setelah ini masih ada error compile lain yang belum ke-cover di
hotfix ini, tempel pesan errornya — kemungkinan ada pola serupa (DTO lain
yang belum saya cek, atau dependency lain yang perlu dipindah ke root).
