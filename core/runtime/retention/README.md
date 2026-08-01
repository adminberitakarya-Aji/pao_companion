# runtime/retention (Phase 4 — P4-5)

`DataRetentionRuntime.run(cutoffDays)` — job batch, dijalankan terjadwal
(lihat `scripts/run-data-retention.ts` + `.github/workflows/data-retention.yml`,
harian jam 03:00 WIB), BUKAN dipanggil dari alur request user biasa.

Kebijakan (detail di `docs/09-safety-and-trust/data-privacy.md`):
- User tidak aktif > `DEFAULT_RETENTION_CUTOFF_DAYS` (730 hari / 24 bulan)
  → email/nama/password hash dianonimkan (`User.anonymize()`), isi pesan
  & memory milik companion-nya dihapus (`RetentionPurgePort`).
- Idempotent — user yang sudah dianonimkan dilewati (`user.isAnonymized`).
- Satu user gagal tidak menghentikan seluruh batch (di-log, lanjut).
- `ModerationFlag`/`CrisisEvent` TIDAK ikut dihapus oleh job ini — audit
  log safety sengaja dipertahankan lebih lama untuk kebutuhan investigasi
  insiden, dan sudah snippet-only (bukan konten penuh) sejak awal.
