// Script diagnostik manual — jalankan dengan:
//   pnpm test:timeline -- <email>
// Contoh:
//   pnpm test:timeline -- aji@pao.test
//
// Akan: (1) coba catat milestone "percakapan pertama" (cuma tercatat
// SEKALI — jalankan 2x untuk lihat bedanya), (2) catat contoh milestone
// "level up" berdasarkan level Relationship saat ini, (3) tampilkan semua
// milestone yang sudah tercatat.

import { PrismaClient } from "@prisma/client";
import { PrismaCompanionRepository } from "../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaRelationshipRepository } from "../core/infrastructure/database/repositories/prisma-relationship.repository";
import { PrismaTimelineEventRepository } from "../core/infrastructure/database/repositories/prisma-timeline-event.repository";
import { RelationshipScorer } from "../core/runtime/relationship/relationship-scorer.service";
import { RelationshipRuntime } from "../core/runtime/relationship/relationship-runtime.service";
import { TimelineRuntime } from "../core/runtime/timeline/timeline-runtime.service";
import { LEVEL_LABELS } from "../core/domain/relationship/relationship-level";
import { ConsoleLogger } from "../core/shared/logger/logger";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Pemakaian: pnpm test:timeline -- <email>");
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

    const logger = new ConsoleLogger("TimelineTest");
    const timelineRepository = new PrismaTimelineEventRepository(prisma);
    const timelineRuntime = new TimelineRuntime(timelineRepository, logger);

    console.log("\n--- Mencoba catat milestone: percakapan pertama ---");
    const firstConvoEvent = await timelineRuntime.recordFirstConversationIfNeeded(companion.id);
    if (firstConvoEvent) {
      console.log(`✅ Tercatat baru: "${firstConvoEvent.description}"`);
    } else {
      console.log("(sudah pernah tercatat sebelumnya — tidak dobel, sesuai desain)");
    }

    console.log("\n--- Mencoba catat milestone: level up (contoh) ---");
    const relationshipRepository = new PrismaRelationshipRepository(prisma);
    const relationshipRuntime = new RelationshipRuntime(
      relationshipRepository,
      new RelationshipScorer(),
      logger,
    );
    const currentRelationship = await relationshipRuntime.getCurrent(companion.id);
    const levelUpEvent = await timelineRuntime.recordLevelUp(companion.id, currentRelationship.level);
    console.log(`✅ Tercatat: "${levelUpEvent.description}"`);
    console.log(`(catatan: ini contoh manual — level sebenarnya: ${currentRelationship.level}/${LEVEL_LABELS[currentRelationship.level]}, poin: ${currentRelationship.affectionPoints})`);

    console.log("\n--- Semua milestone tercatat untuk companion ini ---");
    const events = await timelineRuntime.getRecentEvents(companion.id, 20);
    events.forEach((e, i) => {
      console.log(`${i + 1}. [${e.eventType}] ${e.description} (${e.createdAt.toISOString()})`);
    });

    console.log("\n✅ Selesai.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
