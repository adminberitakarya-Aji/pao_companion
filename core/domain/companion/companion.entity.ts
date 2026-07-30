import { Character, CharacterProps } from "../character/character.entity";

export interface CompanionProps {
  id: string;
  ownerId: string;
  character: Character;
  createdAt?: Date;
}

// Companion adalah AGGREGATE ROOT — satu-satunya pintu masuk untuk
// mengubah Character di dalamnya. Simpan ownerId (string), BUKAN objek
// User utuh — mencegah entity ini "gemuk" dan saling mengunci dengan
// domain User. Kalau butuh data User lengkap, itu tugas use-case di
// core/application yang menggabungkan kedua repository.
export class Companion {
  private constructor(
    public readonly id: string,
    public readonly ownerId: string,
    private _character: Character,
    public readonly createdAt: Date,
  ) {}

  static create(props: CompanionProps): Companion {
    return new Companion(
      props.id,
      props.ownerId,
      props.character,
      props.createdAt ?? new Date(),
    );
  }

  get character(): Character {
    return this._character;
  }

  // Dipanggil dari use-case setelah image provider (fal.ai) selesai generate.
  attachGeneratedAvatar(url: string): void {
    this._character.attachGeneratedAvatar(url);
  }

  markAvatarGenerating(): void {
    this._character.markAvatarGenerating();
  }

  markAvatarFailed(): void {
    this._character.markAvatarFailed();
  }
}
