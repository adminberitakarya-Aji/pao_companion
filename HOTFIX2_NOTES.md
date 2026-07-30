# Hotfix 2 — Perbaikan Path Compile Output `apps/api` — Catatan Penerapan

Perbaikan bug lagi dari saya. Extract menimpa folder `pao-companion`.

## Akar masalah

`Error: Cannot find module 'D:\pao-companion\apps\api\dist\main'`

TypeScript otomatis menghitung "rootDir" berdasarkan file **terluar** yang
ikut ter-compile. Karena `apps/api/src/main.ts` meng-import file dari
`core/` (lewat relative path `../../../../core/...`, lokasinya DI LUAR
folder `apps/api`), TypeScript menganggap root project sebenarnya adalah
**root repo** (`D:\pao-companion`), bukan `apps/api/src`.

Akibatnya, struktur folder hasil compile ikut "meniru" struktur dari root
repo: `main.ts` yang tadinya di `src/main.ts` malah ter-compile jadi
`dist/apps/api/src/main.js` (bukan `dist/main.js` seperti asumsi default
NestJS CLI) — sementara file `core/*` ikut ter-compile ke `dist/core/*`.

## Perbaikan

1. **`apps/api/tsconfig.json`** — set `"rootDir": "../../"` (eksplisit ke
   root repo) supaya TypeScript tidak lagi "menebak" sendiri, dan hasilnya
   konsisten/predictable.
2. **`apps/api/nest-cli.json`** — set `"entryFile": "apps/api/src/main"`
   supaya Nest CLI tahu entry point sebenarnya ada di path bersarang itu,
   bukan `dist/main.js`.
3. **`apps/api/package.json`** — script `"start"` (dipakai saat production,
   BUKAN `pnpm dev`) diarahkan ke `dist/apps/api/src/main.js`.

## Kenapa tidak sekalian dirapikan (path alias, dsb)?

Karena `core/` bukan package workspace terpisah, TypeScript AKAN SELALU
menganggap root repo sebagai rootDir selama ada file yang meng-import
lintas folder seperti ini — itu perilaku bawaan compiler, bukan bug yang
bisa "dihindari", cuma bisa "dikendalikan" (seperti yang saya lakukan di
atas). Solusi lebih rapi (TypeScript project references, atau menjadikan
`core/` package workspace sendiri) adalah refactor lebih besar — bisa kita
lakukan nanti kalau struktur nested ini mulai terasa mengganggu, tapi untuk
sekarang perbaikan ini cukup dan tidak mengubah cara kerja apa pun selain
path compile output.

## Cara extract & verifikasi

```bash
# 1. Hentikan pnpm dev dulu (Ctrl+C)

# 2. Bersihkan cache build LAGI (karena struktur output berubah)
Remove-Item -Recurse -Force apps\api\dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue

# 3. Extract ZIP hotfix ini menimpa folder pao-companion

# 4. Jalankan ulang
pnpm dev
```

Kali ini seharusnya TIDAK ada lagi error `Cannot find module ... dist\main`.
Tempel output lengkapnya lagi — pastikan muncul semua baris `[InstanceLoader]`
untuk `PrismaModule`, `AuthModule`, `CompanionModule`, `PassportModule`,
`JwtModule`, dan akhirnya `[api] listening on http://localhost:3001`.

## Satu pengingat dari pesan Anda sebelumnya

Anda sempat menempel isi `.env` lengkap dengan password database asli di
chat. Kalau belum, saran saya tetap: **ganti password Supabase Anda**
lewat Dashboard → Project Settings → Database → Reset Database Password,
lalu update `.env` lokal dengan yang baru.
