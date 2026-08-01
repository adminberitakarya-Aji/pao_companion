import { randomUUID } from "crypto";
import { MemoryRepository } from "../../domain/memory/memory.repository";
import { Memory } from "../../domain/memory/memory.entity";
import { MemoryExtractor, ExtractMemoriesInput } from "./memory-extractor.service";
import { Logger } from "../../shared/logger/logger";

// Berapa banyak memory lama yang dikirim ke LLM sebagai referensi "jangan
// diulang" — dibatasi supaya prompt tidak membengkak seiring memory
// bertambah banyak. Juga jadi basis pengecekan exact-match di bawah.
const EXISTING_MEMORIES_CONTEXT_LIMIT = 30;

export class MemoryRuntime {
  constructor(
    private readonly memoryRepository: MemoryRepository,
    private readonly memoryExtractor: MemoryExtractor,
    private readonly logger: Logger,
  ) {}

  async processExchange(
    companionId: string,
    input: Omit<ExtractMemoriesInput, "existingMemories">,
  ): Promise<Memory[]> {
    const existing = await this.memoryRepository.findByCompanionId(
      companionId,
      EXISTING_MEMORIES_CONTEXT_LIMIT,
    );
    const existingContents = existing.map((m) => m.content);

    // Lapis pertahanan PERTAMA: LLM diberi tahu fakta apa saja yang sudah
    // ada, supaya tidak mengulang dengan kata-kata berbeda.
    const facts = await this.memoryExtractor.extract({
      ...input,
      existingMemories: existingContents,
    });

    // Lapis pertahanan KEDUA: exact-match check (setelah normalisasi
    // kapitalisasi/spasi) — jaring pengaman murah kalau LLM tetap
    // menghasilkan fakta yang secara harfiah sama (cuma beda kapital, dst),
    // seperti kasus "Nama User adalah Aji" vs "Nama user adalah Aji".
    const seen = new Set(existingContents.map((c) => this.normalize(c)));

    const savedMemories: Memory[] = [];
    for (const fact of facts) {
      const normalized = this.normalize(fact);
      if (seen.has(normalized)) {
        this.logger.info("Fakta duplikat dilewati (sudah tersimpan sebelumnya)", {
          companionId,
          fact,
        });
        continue;
      }

      const memory = Memory.create({ id: randomUUID(), companionId, content: fact });
      await this.memoryRepository.save(memory);
      savedMemories.push(memory);
      seen.add(normalized);   // cegah duplikat dalam 1 batch ekstraksi yang sama juga
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

  private normalize(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
  }
}
