import { randomUUID } from "crypto";
import { MemoryRepository } from "../../domain/memory/memory.repository";
import { Memory } from "../../domain/memory/memory.entity";
import { MemoryExtractor, ExtractMemoriesInput } from "./memory-extractor.service";
import { Logger } from "../../shared/logger/logger";

// Memory Runtime — orkestrator: panggil extractor, simpan hasil fakta
// baru, dan sediakan cara ambil memory terbaru untuk Context Assembler
// (disambungkan di Phase 3 patch 5).
export class MemoryRuntime {
  constructor(
    private readonly memoryRepository: MemoryRepository,
    private readonly memoryExtractor: MemoryExtractor,
    private readonly logger: Logger,
  ) {}

  // Dipanggil SETELAH satu pertukaran pesan selesai (bukan sebelum) —
  // supaya extraction bisa lihat konteks lengkap user+companion sekaligus.
  async processExchange(companionId: string, input: ExtractMemoriesInput): Promise<Memory[]> {
    const facts = await this.memoryExtractor.extract(input);

    const savedMemories: Memory[] = [];
    for (const fact of facts) {
      const memory = Memory.create({ id: randomUUID(), companionId, content: fact });
      await this.memoryRepository.save(memory);
      savedMemories.push(memory);
    }

    if (savedMemories.length > 0) {
      this.logger.info("Memory baru tersimpan", {
        companionId,
        count: savedMemories.length,
      });
    }

    return savedMemories;
  }

  async getRecentMemories(companionId: string, limit: number = 20): Promise<Memory[]> {
    return this.memoryRepository.findByCompanionId(companionId, limit);
  }
}
