import { CharacterAppearance } from "./character-appearance.vo";
import { CharacterTraits } from "./character-traits.vo";
import { CharacterBackstory } from "./character-backstory.vo";
import { AvatarStatus } from "./avatar-status";
import { SpeechStyle, isValidSpeechStyle } from "./speech-style";
import {
  InvalidPersonaTypeError,
  InvalidCharacterNameError,
  InvalidSpeechStyleError,
} from "./character.errors";

export type PersonaType = "girlfriend" | "boyfriend";

const VALID_PERSONA_TYPES: PersonaType[] = ["girlfriend", "boyfriend"];

export interface CharacterProps {
  personaType: PersonaType;
  name: string;
  appearanceDescription: string;
  personalityDescription?: string | null;
  speechStyle?: SpeechStyle | null;
  traits?: string[];
  backstory?: string | null;
  avatarUrl?: string | null;
  avatarStatus?: AvatarStatus;
}

// Character — diperluas Phase 3 patch 4 dengan speechStyle, traits, dan
// backstory, di atas fondasi personaType/appearance/personalityDescription
// dari Phase 1. Semua field baru OPSIONAL — companion lama (dibuat sebelum
// patch ini) tetap valid tanpa perlu migrasi data, cuma tidak punya
// detail tambahan sampai user meng-edit-nya (fitur edit belum ada,
// menyusul kalau dibutuhkan).
export class Character {
  private constructor(
    public readonly personaType: PersonaType,
    private _name: string,
    private _appearance: CharacterAppearance,
    private _personalityDescription: string | null,
    private _speechStyle: SpeechStyle | null,
    private _traits: CharacterTraits,
    private _backstory: CharacterBackstory | null,
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

    let speechStyle: SpeechStyle | null = null;
    if (props.speechStyle) {
      if (!isValidSpeechStyle(props.speechStyle)) {
        throw new InvalidSpeechStyleError(props.speechStyle);
      }
      speechStyle = props.speechStyle;
    }

    return new Character(
      props.personaType,
      trimmedName,
      CharacterAppearance.create(props.appearanceDescription),
      props.personalityDescription?.trim() || null,
      speechStyle,
      CharacterTraits.create(props.traits ?? []),
      props.backstory ? CharacterBackstory.create(props.backstory) : null,
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

  get speechStyle(): SpeechStyle | null {
    return this._speechStyle;
  }

  get traits(): readonly string[] {
    return this._traits.values;
  }

  get backstory(): string | null {
    return this._backstory?.value ?? null;
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

  regenerateAppearance(newDescription: string): void {
    this._appearance = CharacterAppearance.create(newDescription);
    this._avatarUrl = null;
    this._avatarStatus = "pending";
  }
}
