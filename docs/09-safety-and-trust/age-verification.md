# Age Verification

Status: **diimplementasikan** — lihat `core/domain/user/user.entity.ts`
(P4-3).

## Kebijakan

PAO Companion memiliki persona romantis (GIRLFRIEND/BOYFRIEND). Batas
usia registrasi adalah **18 tahun**, bukan cuma "anak-anak ditolak" —
lebih ketat dari batas umum "13 tahun" yang biasa dipakai platform sosial
non-romantis.

## Implementasi

- `RegisterDto` (`apps/api/src/auth/dto/register.dto.ts`) mewajibkan
  field `dateOfBirth` (format ISO date), divalidasi FORMAT-nya saja di
  layer ini (`@IsDateString`).
- Validasi BISNIS ("harus >= 18 tahun") ada di `User.create()`
  (`core/domain/user/user.entity.ts`) — **bukan** di DTO/controller.
  Ini sengaja: supaya aturan umur tidak bisa "bocor" lewat jalur lain
  yang lupa pasang DTO ini (mis. use-case dipanggil langsung dari
  script/test/API lain di masa depan).
- Umur dihitung penuh (tahun+bulan+tanggal), bukan cuma selisih tahun —
  user yang ulang tahun ke-18 besok tetap ditolak hari ini.
- Registrasi under-age melempar `UnderageRegistrationError` (HTTP 403).
- Tanggal lahir tidak valid (masa depan, atau > 120 tahun — indikasi
  typo) melempar `InvalidDateOfBirthError` (HTTP 400).

## Keterbatasan

Ini verifikasi usia **self-declared** (user mengisi sendiri tanggal
lahirnya) — TIDAK ada verifikasi identitas pihak ketiga (KTP, dsb.) di
V1. Ini konsisten dengan pendekatan mayoritas platform companion AI saat
ini, tapi bukan jaminan mutlak terhadap user yang sengaja berbohong soal
usianya. Kalau regulasi atau risiko produk menuntut verifikasi lebih
kuat di masa depan, ini adalah titik yang perlu diperluas (mis.
integrasi verifikasi KTP/Dukcapil untuk pasar Indonesia).
