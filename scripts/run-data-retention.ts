// Job terjadwal (P4-5) — jalankan dengan:
//   pnpm retention:run
// atau dengan cutoff custom (hari):
//   pnpm retention:run -- 30
//
// Dipanggil oleh .github/workflows/data-retention.yml (cron harian).
// TIDAK dipanggil dari alur request user biasa — murni job batch.

import { PrismaClient } from "@prisma/client";
import { PrismaUserRepository } from "../core/infrastructure/database/repositories/prisma-user.repository";
import {
  PrismaRetentionQuery,
  PrismaRetentionPurge,
} from "../core/infrastructure/database/repositories/prisma-retention.repository";
import {
  DataRetentionRuntime,
  DEFAULT_RETENTION_CUTOFF_DAYS,
} from "../core/runtime/retention/data-retention-runtime.service";
import { ConsoleLogger } from "../core/shared/logger/logger";

async function main() {
  const cutoffArg = process.argv[2];
  const cutoffDays = cutoffArg ? parseInt(cutoffArg, 10) : DEFAULT_RETENTION_CUTOFF_DAYS;

  if (Number.isNaN(cutoffDays) || cutoffDays <= 0) {
    console.error("Cutoff hari tidak valid — harus angka positif");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const logger = new ConsoleLogger("DataRetention");
    const runtime = new DataRetentionRuntime(
      new PrismaUserRepository(prisma),
      new PrismaRetentionQuery(prisma),
      new PrismaRetentionPurge(prisma),
      logger,
    );

    const summary = await runtime.run(cutoffDays);
    console.log("[retention] Selesai:", summary);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("[retention] Job gagal total:", error);
  process.exit(1);
});
