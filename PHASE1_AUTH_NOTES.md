# Phase 1 (bagian Auth) — Catatan Penerapan

Patch ini berisi task: **P1-2, P1-4, P1-5, P1-6** dari `ROADMAP.md`
(Domain User, Auth flow, Shared errors/logger/validation, Auth guard).
`P1-1` (schema lengkap) dan `P1-3` (Domain Companion) menyusul di patch berikutnya.

## Cara extract

1. Extract ZIP ini **menimpa** folder `pao-companion` yang sudah ada (isinya
   memang dirancang untuk overlay — path folder sama persis dengan repo Anda).
2. Jangan hapus dulu folder lain yang sudah ada (`docs/`, `packages/`, dst) —
   ZIP ini hanya menambah/mengubah file yang relevan dengan auth.

## File yang ditambahkan/diubah

**Baru:**
- `core/shared/errors/`, `core/shared/logger/`, `core/shared/utils/`, `core/shared/validation/`
- `core/domain/user/` — lengkap (entity, VO, repository interface, errors)
- `core/application/dto/auth.dto.ts`, `core/application/services/token-issuer.service.ts`
- `core/application/use-cases/auth/` — register & login use-case
- `core/infrastructure/database/repositories/prisma-user.repository.ts`
- `core/infrastructure/security/bcrypt-password-hasher.ts`
- `apps/api/src/auth/` — controller, service, module, DTO, JWT strategy, guard
- `apps/api/src/shared/prisma.service.ts`

**Diubah:**
- `apps/api/src/app.module.ts` — daftarkan `AuthModule`
- `apps/api/src/main.ts` — tambah `ValidationPipe` global
- `apps/api/package.json` — tambah bcrypt, passport, class-validator, dll
- `core/infrastructure/database/prisma/schema.prisma` — `password` → `passwordHash`,
  tambah `updatedAt`, `User.name` opsional

## Langkah setelah extract

```bash
pnpm install                 # install dependency baru (bcrypt, passport, dll)
pnpm db:generate             # regenerate Prisma client (schema berubah)
pnpm db:migrate              # buat migration baru untuk perubahan schema User
pnpm dev
```

## Cara verifikasi (Definition of Done Phase 1 — bagian Auth)

```bash
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
# → harus dapat { user: {...}, accessToken: "..." }

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
# → harus dapat accessToken juga

# 3. Endpoint terproteksi TANPA token → harus 401
curl http://localhost:3000/auth/me

# 4. Endpoint terproteksi DENGAN token → harus 200
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <accessToken dari langkah 1/2>"
```

Kalau keempat langkah di atas sesuai ekspektasi, checklist di `PROGRESS.md`
untuk P1-2, P1-4, P1-5, P1-6 bisa diubah jadi selesai.

## Catatan arsitektur penting

1. **Kenapa `AuthService` di `apps/api` terlihat "cuma wiring"?**
   Ini sengaja. `AuthService.register()`/`.login()` HANYA merakit dependency
   (repository, hasher, token issuer) lalu memanggil use-case di
   `core/application`. Business logic sesungguhnya (validasi email,
   pengecekan password, dst) ada di `RegisterUserUseCase`/`LoginUserUseCase`
   dan `User` entity — bukan di sini. Kalau nanti pindah dari NestJS ke
   framework lain, use-case dan domain tidak perlu ditulis ulang.

2. **Kenapa import path ke `core/` pakai relative path panjang**
   (`../../../../core/...`) di `apps/api`?
   Untuk Phase 1 ini kita jaga sederhana dulu. Di Phase 2 kita bisa
   rapikan pakai TypeScript path alias (`@core/*`) supaya lebih bersih —
   sengaja belum dilakukan sekarang supaya patch ini fokus ke satu concern
   (auth), bukan sekaligus restrukturisasi import.

3. **Prisma Client & workspace**: `apps/api/package.json` menambahkan
   `@prisma/client` langsung sebagai dependency. Karena schema ada di
   `core/infrastructure/database`, pastikan jalankan `pnpm db:generate`
   dari root (sudah di-setup lewat script `db:generate` di root
   `package.json`) SEBELUM `pnpm dev`, supaya Prisma Client ter-generate
   dulu — mirip catatan build order `packages/ui` di Klip-AI, urutan
   generate/build ini penting di monorepo.

4. **`InvalidCredentialsError` dipakai untuk 2 kasus** (email tidak
   ditemukan ATAUpassword salah) — ini sengaja untuk keamanan, supaya
   response API tidak membocorkan apakah suatu email terdaftar atau tidak.

## Belum termasuk di patch ini (menyusul)
- P1-1 penuh: schema `Character` + relasi lengkap `Companion`
- P1-3: Domain `Companion` (entity, appearance VO, dll — sesuai desain yang sudah dibahas)
- Refresh token / logout (opsional, belum ada di roadmap awal — beri tahu saya kalau perlu ditambahkan)
