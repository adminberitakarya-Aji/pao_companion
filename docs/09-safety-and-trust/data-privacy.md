# Data Privacy & Retention

Status: **diimplementasikan** — lihat `core/runtime/retention/` (P4-5).
Selaras dengan UU No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP).

## Kebijakan retensi

- **User tidak aktif > 24 bulan** (`DEFAULT_RETENTION_CUTOFF_DAYS = 730`
  di `data-retention-runtime.service.ts`) — dianggap sudah tidak
  memerlukan layanan, data personalnya dianonimkan otomatis:
  - `User.email`, `name`, `passwordHash` di-scrub menjadi nilai yang
    tidak bisa dikembalikan (`User.anonymize()`).
  - Isi pesan (`Message.content`) di companion miliknya di-redact
    menjadi placeholder generik.
  - `Memory` (fakta personal yang diekstrak dari percakapan) dihapus.
  - `Relationship` (skor angka) & `TimelineEvent` (label milestone
    generik) **dipertahankan** — bukan PII granular, berguna untuk
    statistik agregat non-identifikasi.
- **Aktivitas terakhir** dihitung dari pesan terakhir di conversation
  companion-nya; kalau belum pernah chat sama sekali, dari tanggal akun
  dibuat.
- Proses **idempotent** — user yang sudah dianonimkan (`anonymizedAt`
  terisi) dilewati di run berikutnya.

## Audit log safety (ModerationFlag, CrisisEvent)

**TIDAK** ikut dihapus/dianonimkan oleh job retensi ini. Kedua tabel ini
sudah dirancang privacy-conscious sejak awal (snippet maks 200 karakter,
bukan konten penuh) dan retensinya lebih lama untuk kebutuhan investigasi
insiden keselamatan — kebijakan retensi audit log ini terpisah dan perlu
ditinjau ulang saat volume data bertambah signifikan.

## Menjalankan job

- Script: `scripts/run-data-retention.ts` (`pnpm retention:run`)
- Terjadwal: `.github/workflows/data-retention.yml`, cron harian
  03:00 WIB (`20 19 * * *` UTC)
- Satu user yang gagal diproses TIDAK menghentikan seluruh batch —
  dicatat lewat logger, job lanjut ke kandidat berikutnya.

## Permintaan hapus akun manual (di luar cron)

Belum ada endpoint self-service "hapus akun saya sekarang" di Phase 4 —
job ini murni berbasis inaktivitas terjadwal. Menambahkan endpoint
`DELETE /users/me` yang memanggil `User.anonymize()` + purge langsung
(alih-alih menunggu cron) adalah kandidat task follow-up sebelum rilis
publik, supaya memenuhi hak "right to erasure" UU PDP secara on-demand,
bukan cuma terjadwal.
