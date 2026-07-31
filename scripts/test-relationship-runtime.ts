// Script diagnostik manual — jalankan dengan:
//   pnpm test:relationship -- <email> [jumlah-simulasi-pesan]
// Contoh:
//   pnpm test:relationship -- aji@pao.test 30
// Ini akan mensimulasikan N pesan berturut-turut ke companion (BUKAN pesan
// sungguhan yang tersimpan sebagai Message — cuma nge-test skor & level
// Relationship-nya), supaya Anda bisa lihat progres level tanpa harus
// benar-benar chat puluhan kali.

import { PrismaClient } from "@prisma/client";
import { PrismaCompanionRepository } from "../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaRelationshipRepository } from "../core/infrastructure/database/repositories/prisma-relationship.repository";
import { RelationshipScorer } from "../core/runtime/relationship/relationship-scorer.service";
import { RelationshipRuntime } from "../core/runtime/relationship/relationship-runtime.service";
import { LEVEL_LABELS } from "../core/domain/relationship/relationship-level";
import { ConsoleLogger } from "../core/shared/logger/logger";

const SAMPLE_MESSAGES = [
  "Halo!",
  "Lagi apa kamu?",
  "Aku hari ini capek banget kerja",
  "Btw kamu suka warna apa?",
  "Aku kangen ngobrol sama kamu",
];

async function main() {
  const email = process.argv[2];
  const rounds = parseInt(process.argv[3] ?? "10", 10);

  if (!email) {
    console.error("Pemakaian: pnpm test:relationship -- <email> [jumlah-simulasi-pesan]");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User dengan email ${email} tidak ditemukan`);
      process.exit(1);
    }

    const companionRepository = new PrismaCompanionRepository(prisma);
    const companion = await companionRepository.findByOwnerId(user.id);
    if (!companion) {
      console.error(`User ${email} belum punya companion`);
      process.exit(1);
    }

    const relationshipRepository = new PrismaRelationshipRepository(prisma);
    const scorer = new RelationshipScorer();
    const logger = new ConsoleLogger("RelationshipTest");
    const relationshipRuntime = new RelationshipRuntime(relationshipRepository, scorer, logger);

    const current = await relationshipRuntime.getCurrent(companion.id);
    console.log(`\nRelationship saat ini: Level ${current.level} (${LEVEL_LABELS[current.level]}), ${current.affectionPoints} poin\n`);

    console.log(`Mensimulasikan ${rounds} pertukaran pesan...\n`);

    for (let i = 0; i < rounds; i++) {
      const message = SAMPLE_MESSAGES[i % SAMPLE_MESSAGES.length];
      const { relationship, leveledUp } = await relationshipRuntime.processExchange(companion.id, message);

      const marker = leveledUp ? " 🎉 LEVEL UP!" : "";
      console.log(
        `[${i + 1}/${rounds}] +poin -> Level ${relationship.level} (${LEVEL_LABELS[relationship.level]}), total ${relationship.affectionPoints} poin${marker}`,
      );
    }

    console.log("\n✅ Simulasi selesai.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
