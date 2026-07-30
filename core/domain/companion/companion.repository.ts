import { Companion } from "./companion.entity";

// HANYA ada CompanionRepository — tidak ada CharacterRepository terpisah,
// karena Character bukan aggregate root sendiri (lihat catatan di
// character.entity.ts). Simpan/ambil Companion selalu ikut Character-nya.
export interface CompanionRepository {
  findById(id: string): Promise<Companion | null>;
  findByOwnerId(ownerId: string): Promise<Companion | null>;
  save(companion: Companion): Promise<void>;
}

export const COMPANION_REPOSITORY = Symbol("COMPANION_REPOSITORY");
