// Script diagnostik manual — INI TES END-TO-END LENGKAP (menyatukan semua
// patch Phase 2). Jalankan dengan:
//   pnpm test:conversation -- <email-user> "<pesan>"
// Contoh:
//   pnpm test:conversation -- aji@pao.test "Halo, lagi ngapain kamu?"
//
// Ini akan BENAR-BENAR memanggil Gemini/Claude (pakai kuota API key Anda)
// dan menyimpan pesan ke database — beda dari test:prompt yang cuma cek
// susunan prompt tanpa memanggil LLM.

import { PrismaClient } from "@prisma/client";
import { PrismaCompanionRepository } from "../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaConversationRepository } from "../core/infrastructure/database/repositories/prisma-conversation.repository";
import { PrismaMessageRepository } from "../core/infrastructure/database/repositories/prisma-message.repository";
import { ContextAssembler } from "../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../core/runtime/prompt/prompt-builder.service";
import { ProviderRuntime } from "../core/runtime/provider/provider-runtime.service";
import { ConversationRuntime } from "../core/runtime/conversation/conversation-runtime.service";
import { LlmProviderFactory } from "../core/infrastructure/providers/llm/llm-provider.factory";
import { ConsoleLogger } from "../core/shared/logger/logger";

async function main() {
  const email = process.argv[2];
  const userMessage = process.argv[3];

  if (!email || !userMessage) {
    console.error("Pemakaian: pnpm test:conversation -- <email-user> \"<pesan>\"");
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
    const contextAssembler = new ContextAssembler(companionRepository, messageRepository);
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("ConversationRuntime");
    const providerRuntime = new ProviderRuntime(new LlmProviderFactory(), logger);

    const conversationRuntime = new ConversationRuntime(
      conversationRepository,
      messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
    );

    console.log(`\nMengirim pesan sebagai user ke companion "${companion.character.name}"...`);
    console.log(`Pesan: "${userMessage}"\n`);

    const result = await conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage,
    });

    console.log("=== Balasan Companion ===");
    console.log(result.reply);
    console.log(`\n(provider yang merespons: ${result.providerId})`);
    console.log(`(conversationId: ${result.conversationId})`);
    console.log("\n✅ Vertical slice percakapan berhasil end-to-end!");
  } finally {
    await prisma.$disconnect();
  }
}

main();
