import { Memory } from "./memory.entity";

export interface MemoryRepository {
  save(memory: Memory): Promise<void>;
  // Urutan hasil: TERBARU dulu — konsumen (Context Assembler di patch 5)
  // yang memutuskan mau dibalik urutannya atau tidak.
  findByCompanionId(companionId: string, limit: number): Promise<Memory[]>;
}

export const MEMORY_REPOSITORY = Symbol("MEMORY_REPOSITORY");
