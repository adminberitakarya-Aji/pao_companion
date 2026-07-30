import { InvalidAppearanceError } from "./character.errors";

const MIN_LENGTH = 5;
const MAX_LENGTH = 500;

// Value Object — deskripsi tampilan dalam bentuk teks (BUKAN foto asli,
// sesuai keputusan produk: user tidak bisa upload foto orang nyata untuk
// dijadikan basis companion).
export class CharacterAppearance {
  private constructor(public readonly value: string) {}

  static create(raw: string): CharacterAppearance {
    const trimmed = raw.trim();

    if (trimmed.length < MIN_LENGTH) {
      throw new InvalidAppearanceError(
        `Deskripsi tampilan minimal ${MIN_LENGTH} karakter`,
      );
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new InvalidAppearanceError(
        `Deskripsi tampilan maksimal ${MAX_LENGTH} karakter`,
      );
    }

    // TODO Phase 4 (P4-1): panggil content moderation service di sini —
    // cek referensi nama orang nyata/selebriti, karakter berlisensi, dan
    // deskripsi eksplisit SEBELUM masuk ke image generation provider.
    // Belum diimplementasi di patch ini — jangan anggap sudah aman.

    return new CharacterAppearance(trimmed);
  }
}
