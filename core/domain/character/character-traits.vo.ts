import { InvalidTraitsError } from "./character.errors";

const MAX_TRAITS = 8;
const MAX_TRAIT_LENGTH = 30;

// Value Object — daftar sifat singkat (mis. "humoris", "perhatian",
// "protektif"). Dibatasi jumlah & panjang supaya tetap ringkas dan
// gampang di-render ke prompt (bukan paragraf panjang — itu tugas
// backstory/personalityDescription).
export class CharacterTraits {
  private constructor(public readonly values: readonly string[]) {}

  static create(raw: string[]): CharacterTraits {
    const cleaned = raw.map((t) => t.trim()).filter((t) => t.length > 0);

    if (cleaned.length > MAX_TRAITS) {
      throw new InvalidTraitsError(`Maksimal ${MAX_TRAITS} traits`);
    }
    for (const trait of cleaned) {
      if (trait.length > MAX_TRAIT_LENGTH) {
        throw new InvalidTraitsError(
          `Setiap trait maksimal ${MAX_TRAIT_LENGTH} karakter (bermasalah: "${trait}")`,
        );
      }
    }

    return new CharacterTraits(cleaned);
  }

  static empty(): CharacterTraits {
    return new CharacterTraits([]);
  }
}
