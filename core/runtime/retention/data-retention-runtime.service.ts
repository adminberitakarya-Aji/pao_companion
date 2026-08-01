import { UserRepository } from "../../domain/user/user.repository";
import { RetentionQueryPort, RetentionPurgePort } from "../../application/services/retention.port";
import { Logger } from "../../shared/logger/logger";

// Default kebijakan retensi: 24 bulan tidak aktif -> anonimkan. Angka ini
// SENGAJA dijadikan parameter run(), bukan hardcoded, supaya bisa
// dites/di-tuning tanpa ubah kode (lihat docs/09-safety-and-trust/data-privacy.md).
export const DEFAULT_RETENTION_CUTOFF_DAYS = 730;

export interface DataRetentionSummary {
  candidatesFound: number;
  usersAnonymized: number;
  companionsPurged: number;
}

// Data Retention Runtime — dipanggil oleh script terjadwal
// (scripts/run-data-retention.ts), BUKAN dari alur request user biasa.
// Orkestrasi: cari kandidat -> anonimkan User lewat domain entity (supaya
// invariant "tidak menimpa anonymizedAt yang sudah ada" tetap dijaga oleh
// User.anonymize()) -> purge data companion terkait lewat port terpisah.
export class DataRetentionRuntime {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly retentionQuery: RetentionQueryPort,
    private readonly retentionPurge: RetentionPurgePort,
    private readonly logger: Logger,
  ) {}

  async run(cutoffDays: number = DEFAULT_RETENTION_CUTOFF_DAYS): Promise<DataRetentionSummary> {
    const cutoff = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000);
    const candidates = await this.retentionQuery.findAnonymizationCandidates(cutoff);

    this.logger.info("Data retention job dimulai", {
      cutoffDays,
      cutoff: cutoff.toISOString(),
      candidatesFound: candidates.length,
    });

    let usersAnonymized = 0;
    let companionsPurged = 0;

    for (const candidate of candidates) {
      try {
        const user = await this.userRepository.findById(candidate.userId);
        if (!user || user.isAnonymized) continue;

        user.anonymize();
        await this.userRepository.save(user);
        usersAnonymized += 1;

        if (candidate.companionId) {
          await this.retentionPurge.purgeCompanionData(candidate.companionId);
          companionsPurged += 1;
        }
      } catch (error) {
        // Satu user gagal TIDAK boleh menghentikan seluruh batch — dicatat
        // & lanjut ke kandidat berikutnya, supaya kegagalan satu record
        // (mis. race condition ringan) tidak bikin job berhenti total.
        this.logger.error("Gagal memproses retensi untuk satu user", {
          userId: candidate.userId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const summary: DataRetentionSummary = {
      candidatesFound: candidates.length,
      usersAnonymized,
      companionsPurged,
    };
    this.logger.info("Data retention job selesai", { ...summary });
    return summary;
  }
}
