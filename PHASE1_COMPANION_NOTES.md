# Phase 1 (bagian Companion & Character) — Catatan Penerapan

Patch ini berisi task **P1-1 (lengkap) dan P1-3** dari `ROADMAP.md`.
Melanjutkan patch sebelumnya (`pao-companion-phase1-auth-patch.zip`) — extract
patch ini SETELAH patch auth sudah di-extract dan jalan normal.

## Cara extract

Sama seperti patch auth: extract **menimpa** folder `pao-companion` yang sudah ada.

## Keputusan desain yang diimplementasikan di sini

1. **`Character` bukan aggregate root sendiri** — dia hidup di dalam aggregate
   `Companion` (1 tabel `companions` di database, bukan 2 tabel terpisah).
   Alasan: karena kebijakan produk 1 companion = 1 karakter, siklus hidup
   keduanya selalu menempel, jadi tidak perlu repository terpisah.
   Kalau nanti kebijakan berubah (misal: 1 companion bisa multi-karakter),
   ini titik yang perlu di-refactor duluan.

2. **`personaType` immutable** — tidak ada method di `Character` atau
   endpoint di `CompanionController` untuk mengubahnya. Sesuai keputusan
   Anda: ganti tipe = bikin companion baru (yang otomatis tidak bisa
   terjadi karena `ownerId @unique` — 1 user hanya bisa 1 companion).

3. **Avatar generation ASYNC lewat queue** — endpoint `POST /companions`
   TIDAK menunggu gambar selesai di-generate. Companion langsung dibuat
   dengan `avatarStatus: "generating"`, lalu (nantinya) worker terpisah
   yang panggil fal.ai dan update `avatarUrl` + `avatarStatus: "ready"`.

4. **`NoopAvatarGenerationQueue` — PENTING, ini stub sementara.**
   Di patch ini, avatar TIDAK benar-benar di-generate — cuma di-log
   sebagai warning. Ini sengaja, supaya endpoint `POST /companions` sudah
   bisa dites end-to-end SEKARANG tanpa menunggu integrasi fal.ai selesai
   (menyusul di patch Phase 2). Jangan lupa ganti implementasi ini sebelum
   production — sudah saya kasih komentar `TODO` di kodenya.

5. **`PrismaModule` dibuat `@Global()`** — memperbaiki masalah yang
   sebenarnya ada laten sejak patch auth: kalau setiap module (`AuthModule`,
   `CompanionModule`) provide `PrismaService` sendiri-sendiri, itu jadi
   2 koneksi database terpisah yang tidak perlu. Sekarang `PrismaModule`
   di-import sekali di `AppModule`, module lain tinggal inject.

## File yang ditambahkan/diubah

**Baru:**
- `core/domain/character/` — entity, appearance VO, avatar status, errors
- `core/domain/companion/` — aggregate root, repository interface, errors
- `core/application/dto/companion.dto.ts`, `core/application/services/avatar-generation-queue.service.ts`
- `core/application/use-cases/companion/` — create & get-my-companion
- `core/infrastructure/database/repositories/prisma-companion.repository.ts`
- `core/infrastructure/queue/noop-avatar-generation-queue.ts` (STUB — lihat poin 4)
- `apps/api/src/companion/` — controller, service, module, DTO
- `apps/api/src/shared/prisma.module.ts`

**Diubah:**
- `apps/api/src/app.module.ts` — daftarkan `PrismaModule`, `CompanionModule`
- `apps/api/src/auth/auth.module.ts` — hapus provide `PrismaService` (sekarang global)
- `core/infrastructure/database/prisma/schema.prisma` — tambah enum
  `PersonaType`/`AvatarStatus`, field lengkap `Companion`, relasi `User.companion` (1:1)

## Langkah setelah extract

```bash
pnpm install
pnpm db:generate
pnpm db:migrate       # akan minta nama migration, misal: add_companion_character
pnpm dev
```

## Cara verifikasi (Definition of Done)

```bash
# 1. Login dulu (pakai user dari patch auth sebelumnya) untuk dapat token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}" | jq -r .accessToken)

# 2. Buat companion
curl -X POST http://localhost:3000/companions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"personaType\":\"girlfriend\",\"name\":\"Aya\",\"appearanceDescription\":\"Perempuan muda, rambut hitam sebahu, gaya kasual\"}"
# -> harus dapat companion dengan avatarStatus: "generating"

# 3. Coba buat companion KEDUA dengan user yang sama -> harus GAGAL (409)
curl -X POST http://localhost:3000/companions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"personaType\":\"boyfriend\",\"name\":\"Rian\",\"appearanceDescription\":\"Laki-laki, tinggi, rambut pendek\"}"
# -> harus dapat error 409 COMPANION_ALREADY_EXISTS

# 4. Ambil companion milik user
curl http://localhost:3000/companions/me -H "Authorization: Bearer $TOKEN"
# -> harus dapat companion "Aya" yang dibuat di langkah 2
```

Kalau keempatnya sesuai ekspektasi, checklist `P1-1` dan `P1-3` di
`PROGRESS.md` bisa diubah jadi selesai — **Phase 1 lengkap** 🎉

## Belum termasuk di patch ini (menyusul di Phase 2)
- Integrasi asli fal.ai (`core/infrastructure/providers/image/`) — avatar
  masih stub, belum benar-benar tergenerate
- Queue system asli (BullMQ) menggantikan `NoopAvatarGenerationQueue`
- Endpoint untuk `regenerateAppearance` (ubah deskripsi tampilan) — domain
  method-nya sudah ada (`Character.regenerateAppearance()`), tinggal
  disambungkan ke controller kalau Anda mau fitur ini di Phase 1 juga
  (belum saya buat karena belum ada di roadmap awal — beri tahu kalau perlu)
