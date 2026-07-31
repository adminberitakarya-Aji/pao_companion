import { InvalidBackstoryError } from "./character.errors";

const MAX_BACKSTORY_LENGTH = 1000;

// Value Object — latar belakang/cerita singkat karakter (opsional).
// SAMA seperti CharacterAppearance: validasi di sini adalah tempat
// moderation check (P4-1) nanti akan dipasang — belum diimplementasi
// di patch ini, jangan anggap sudah aman.
export class CharacterBackstory {
  private constructor(public readonly value: string) {}

  static create(raw: string): CharacterBackstory {
    const trimmed = raw.trim();
    if (trimmed.length > MAX_BACKSTORY_LENGTH) {
      throw new InvalidBackstoryError(`Backstory maksimal ${MAX_BACKSTORY_LENGTH} karakter`);
    }
    // TODO Phase 4 (P4-1): panggil content moderation service di sini —
    // sama seperti CharacterAppearance.
    return new CharacterBackstory(trimmed);
  }
}
