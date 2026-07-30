import { CharacterAppearance } from "./character-appearance.vo";
import { AvatarStatus } from "./avatar-status";
import { InvalidPersonaTypeError, InvalidCharacterNameError } from "./character.errors";

export type PersonaType = "girlfriend" | "boyfriend";

const VALID_PERSONA_TYPES: PersonaType[] = ["girlfriend", "boyfriend"];

export interface CharacterProps {
  personaType: PersonaType;
  name: string;
  appearanceDescription: string;
  personalityDescription?: string | null;
  avatarUrl?: string | null;
  avatarStatus?: AvatarStatus;
}

// Character BUKAN aggregate root sendiri — dia hidup di dalam aggregate
// Companion (lihat companion.entity.ts). Alasan: siklus hidup Character
// selalu menempel ke satu Companion (dibuat bersama, tidak pernah berdiri
// sendiri), jadi tidak perlu repository terpisah untuk Character.
export class Character {
  private constructor(
    public readonly personaType: PersonaType,
    private _name: string,
    private _appearance: CharacterAppearance,
    private _personalityDescription: string | null,
    private _avatarUrl: string | null,
    private _avatarStatus: AvatarStatus,
  ) {}

  static create(props: CharacterProps): Character {
    if (!VALID_PERSONA_TYPES.includes(props.personaType)) {
      throw new InvalidPersonaTypeError(props.personaType);
    }
    const trimmedName = props.name.trim();
    if (trimmedName.length < 2) {
      throw new InvalidCharacterNameError("Nama companion minimal 2 karakter");
    }

    return new Character(
      props.personaType,
      trimmedName,
      CharacterAppearance.create(props.appearanceDescription),
      props.personalityDescription?.trim() || null,
      props.avatarUrl ?? null,
      props.avatarStatus ?? "pending",
    );
  }

  get name(): string {
    return this._name;
  }

  get appearanceDescription(): string {
    return this._appearance.value;
  }

  get personalityDescription(): string | null {
    return this._personalityDescription;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get avatarStatus(): AvatarStatus {
    return this._avatarStatus;
  }

  markAvatarGenerating(): void {
    this._avatarStatus = "generating";
  }

  attachGeneratedAvatar(url: string): void {
    this._avatarUrl = url;
    this._avatarStatus = "ready";
  }

  markAvatarFailed(): void {
    this._avatarStatus = "failed";
  }

  // Ubah deskripsi tampilan — reset avatar karena harus di-generate ulang.
  // personaType SENGAJA tidak punya method untuk diubah (immutable, sesuai
  // keputusan produk: ganti tipe = bikin companion baru, bukan edit).
  regenerateAppearance(newDescription: string): void {
    this._appearance = CharacterAppearance.create(newDescription);
    this._avatarUrl = null;
    this._avatarStatus = "pending";
  }
}
