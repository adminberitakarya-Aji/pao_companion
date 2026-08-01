// Ports untuk Data Retention (P4-5) — SENGAJA di application/services,
// bukan domain/, karena query kandidat retensi melintasi beberapa
// aggregate (User + Companion + Message) sekaligus untuk kebutuhan batch
// job. Ini pengecualian pragmatis yang umum untuk operasi jenis
// GDPR/PDP-compliance, bukan pola yang dipakai untuk business logic biasa.

export interface RetentionCandidate {
  userId: string;
  companionId: string | null;
}

export interface RetentionQueryPort {
  // User dianggap "tidak aktif" kalau pesan TERAKHIR di conversation-nya
  // (atau, kalau belum pernah chat sama sekali, waktu akun dibuat) lebih
  // lama dari `cutoff`, dan belum pernah dianonimkan sebelumnya.
  findAnonymizationCandidates(cutoff: Date): Promise<RetentionCandidate[]>;
}

export interface RetentionPurgePort {
  // Hapus SEMUA data personal terkait satu companion: isi pesan (Message),
  // Memory. Companion & Conversation record sendiri dipertahankan (biar
  // relasi tidak patah) tapi jadi "kosong" — Relationship/TimelineEvent
  // dipertahankan karena isinya bukan PII granular (skor angka & label
  // milestone generik), berguna untuk analitik agregat non-identifikasi.
  purgeCompanionData(companionId: string): Promise<void>;
}

export const RETENTION_QUERY_PORT = Symbol("RETENTION_QUERY_PORT");
export const RETENTION_PURGE_PORT = Symbol("RETENTION_PURGE_PORT");
