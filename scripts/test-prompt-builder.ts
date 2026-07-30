// Script diagnostik manual — jalankan dengan:
//   pnpm test:prompt -- <email-user-pemilik-companion>
// Contoh:
//   pnpm test:prompt -- test@example.com
//
// Tujuannya: cek ContextAssembler + PromptBuilder menghasilkan system
// prompt yang masuk akal dari companion yang SUDAH ada di database
// (misal "Aya" yang dibuat waktu verifikasi Phase 1). Belum memanggil LLM
// sungguhan di sini — cuma cek hasil rakitan prompt-nya.

import { PrismaClient } from "@prisma/client";
import { PrismaCompanionRepository } from "../core/infrastructure/database/repositories/prisma-companion.repository";
import { PrismaMessageRepository } from "../core/infrastructure/database/repositories/prisma-message.repository";
import { ContextAssembler } from "../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../core/runtime/prompt/prompt-builder.service";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Pemakaian: pnpm test:prompt -- <email-user>");
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
      console.error(`User ${email} belum punya companion. Buat dulu lewat POST /companions.`);
      process.exit(1);
    }

    const messageRepository = new PrismaMessageRepository(prisma);
    const contextAssembler = new ContextAssembler(companionRepository, messageRepository);

    // conversationId dummy karena belum ada Conversation record sungguhan
    // di tahap ini (itu baru dibuat di patch 3 saat runtime percakapan
    // jalan) — history akan kosong, itu WAJAR untuk tes ini.
    const context = await contextAssembler.assemble({
      conversationId: "dummy-not-yet-created",
      companionId: companion.id,
      latestUserMessage: "Hai, lagi apa kamu?",
    });

    console.log("\n=== ConversationContext ===");
    console.log(JSON.stringify(context, null, 2));

    const promptBuilder = new PromptBuilder();
    const generateInput = promptBuilder.build(context);

    console.log("\n=== System Prompt yang dihasilkan ===");
    console.log(generateInput.messages[0].content);

    console.log("\n=== Semua messages yang akan dikirim ke LLM ===");
    console.log(JSON.stringify(generateInput.messages, null, 2));

    console.log("\n✅ Context assembly & prompt building berhasil.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
