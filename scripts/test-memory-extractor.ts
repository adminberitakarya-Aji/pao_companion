// Script diagnostik manual — jalankan dengan:
//   pnpm test:memory -- "<pesan user>" "<balasan companion>" [email-untuk-simpan]
// Contoh (tanpa simpan ke DB, cuma tes ekstraksi):
//   pnpm test:memory -- "Aku kerja sebagai guru SD di Semarang" "Wah keren! Udah berapa lama ngajar?"
// Contoh (dengan simpan ke DB, companion milik user ini):
//   pnpm test:memory -- "Aku kerja sebagai guru SD di Semarang" "Wah keren!" aji@pao.test

import { PrismaClient } from "@prisma/client";
import { GeminiFlashProvider } from "../core/infrastructure/providers/llm/gemini-flash.provider";
import { MemoryExtractor } from "../core/runtime/memory/memory-extractor.service";
import { MemoryRuntime } from "../core/runtime/memory/memory-runtime.service";
import { PrismaMemoryRepository } from "../core/infrastructure/database/repositories/prisma-memory.repository";
import { PrismaCompanionRepository } from "../core/infrastructure/database/repositories/prisma-companion.repository";
import { ConsoleLogger } from "../core/shared/logger/logger";

async function main() {
  const userMessage = process.argv[2];
  const companionReply = process.argv[3];
  const email = process.argv[4];

  if (!userMessage || !companionReply) {
    console.error(
      "Pemakaian: pnpm test:memory -- \"<pesan user>\" \"<balasan companion>\" [email-untuk-simpan]",
    );
    process.exit(1);
  }

  const logger = new ConsoleLogger("MemoryTest");
  const provider = new GeminiFlashProvider();
  const extractor = new MemoryExtractor(provider, logger);

  console.log("\nMengekstrak fakta dari pertukaran pesan...");
  console.log(`USER: ${userMessage}`);
  console.log(`COMPANION: ${companionReply}\n`);

  const facts = await extractor.extract({ userMessage, companionReply });

  console.log("=== Fakta yang berhasil diekstrak ===");
  if (facts.length === 0) {
    console.log("(tidak ada — wajar kalau pesan tidak mengandung info personal baru)");
  } else {
    facts.forEach((f, i) => console.log(`${i + 1}. ${f}`));
  }

  if (!email) {
    console.log("\n(tidak disimpan ke DB — jalankan lagi dengan argumen email kalau mau simpan)");
    return;
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`\nUser dengan email ${email} tidak ditemukan — fakta di atas TIDAK disimpan`);
      return;
    }
    const companionRepository = new PrismaCompanionRepository(prisma);
    const companion = await companionRepository.findByOwnerId(user.id);
    if (!companion) {
      console.error(`\nUser ${email} belum punya companion — fakta di atas TIDAK disimpan`);
      return;
    }

    const memoryRepository = new PrismaMemoryRepository(prisma);
    const memoryRuntime = new MemoryRuntime(memoryRepository, extractor, logger);
    const saved = await memoryRuntime.processExchange(companion.id, { userMessage, companionReply });

    console.log(`\n✅ ${saved.length} memory tersimpan untuk companion "${companion.character.name}"`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
