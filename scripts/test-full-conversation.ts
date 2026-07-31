// Script diagnostik manual — INI TES PALING LENGKAP di Phase 3. Jalankan:
//   pnpm test:full-conversation -- <email> "<pesan>"
// Contoh:
//   pnpm test:full-conversation -- aji@pao.test "Aku baru pulang kerja, capek banget"
//
// Beda dari test:conversation (Phase 2) — script ini pakai ConversationRuntime
// versi LENGKAP (dengan RelationshipRuntime, TimelineRuntime, MemoryRuntime
// semua tersambung), persis seperti yang dipakai endpoint HTTP sungguhan.
// Jalankan beberapa kali dengan pesan berbeda untuk lihat level naik &
// memory terkumpul seiring waktu.

import { PrismaClient } from "@prisma/client";
import { PrismaCompanionRepository } from "../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaConversationRepository } from "../core/infrastructure/database/repositories/prisma-conversation.repository";
import { PrismaMessageRepository } from "../core/infrastructure/database/repositories/prisma-message.repository";
import { PrismaMemoryRepository } from "../core/infrastructure/database/repositories/prisma-memory.repository";
import { PrismaRelationshipRepository } from "../core/infrastructure/database/repositories/prisma-relationship.repository";
import { PrismaTimelineEventRepository } from "../core/infrastructure/database/repositories/prisma-timeline-event.repository";
import { ContextAssembler } from "../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../core/runtime/prompt/prompt-builder.service";
import { ProviderRuntime } from "../core/runtime/provider/provider-runtime.service";
import { ConversationRuntime } from "../core/runtime/conversation/conversation-runtime.service";
import { RelationshipRuntime } from "../core/runtime/relationship/relationship-runtime.service";
import { RelationshipScorer } from "../core/runtime/relationship/relationship-scorer.service";
import { TimelineRuntime } from "../core/runtime/timeline/timeline-runtime.service";
import { MemoryRuntime } from "../core/runtime/memory/memory-runtime.service";
import { MemoryExtractor } from "../core/runtime/memory/memory-extractor.service";
import { LlmProviderFactory } from "../core/infrastructure/providers/llm/llm-provider.factory";
import { GeminiFlashProvider } from "../core/infrastructure/providers/llm/gemini-flash.provider";
import { ConsoleLogger } from "../core/shared/logger/logger";
import { LEVEL_LABELS } from "../core/domain/relationship/relationship-level";

async function main() {
  const email = process.argv[2];
  const userMessage = process.argv[3];

  if (!email || !userMessage) {
    console.error("Pemakaian: pnpm test:full-conversation -- <email> \"<pesan>\"");
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
      console.error(`User ${email} belum punya companion.`);
      process.exit(1);
    }

    const conversationRepository = new PrismaConversationRepository(prisma);
    const messageRepository = new PrismaMessageRepository(prisma);
    const memoryRepository = new PrismaMemoryRepository(prisma);
    const relationshipRepository = new PrismaRelationshipRepository(prisma);
    const timelineEventRepository = new PrismaTimelineEventRepository(prisma);

    const contextAssembler = new ContextAssembler(
      companionRepository,
      messageRepository,
      memoryRepository,
      relationshipRepository,
    );
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("FullConversationTest");
    const providerRuntime = new ProviderRuntime(new LlmProviderFactory(), logger);
    const relationshipRuntime = new RelationshipRuntime(
      relationshipRepository,
      new RelationshipScorer(),
      logger,
    );
    const timelineRuntime = new TimelineRuntime(timelineEventRepository, logger);
    const memoryExtractor = new MemoryExtractor(new GeminiFlashProvider(), logger);
    const memoryRuntime = new MemoryRuntime(memoryRepository, memoryExtractor, logger);

    const conversationRuntime = new ConversationRuntime(
      conversationRepository,
      messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
      relationshipRuntime,
      timelineRuntime,
      memoryRuntime,
    );

    console.log(`\nMengirim pesan sebagai user ke companion "${companion.character.name}"...`);
    console.log(`Pesan: "${userMessage}"\n`);

    const result = await conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage,
    });

    console.log("=== Balasan Companion ===");
    console.log(result.reply);
    console.log(`\n(provider: ${result.providerId})`);
    console.log(
      `(relationship level: ${result.relationshipLevel} - ${result.relationshipLevel ? LEVEL_LABELS[result.relationshipLevel] : "-"})`,
    );
    console.log(`(level up di pesan ini: ${result.leveledUp ? "YA 🎉" : "tidak"})`);

    const recentMemories = await memoryRuntime.getRecentMemories(companion.id, 10);
    console.log(`\n=== Memory yang tersimpan sejauh ini (${recentMemories.length}) ===`);
    recentMemories.forEach((m, i) => console.log(`${i + 1}. ${m.content}`));

    console.log("\n✅ Full conversation flow (Memory + Relationship + Timeline) berhasil!");
  } finally {
    await prisma.$disconnect();
  }
}

main();
