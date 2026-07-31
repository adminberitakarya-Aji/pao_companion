import { PersonaType } from "../../domain/character/character.entity";
import { SpeechStyle } from "../../domain/character/speech-style";

export interface CreateCompanionInput {
  ownerId: string;
  personaType: PersonaType;
  name: string;
  appearanceDescription: string;
  personalityDescription?: string;
  speechStyle?: SpeechStyle;
  traits?: string[];
  backstory?: string;
}

export interface CompanionResult {
  id: string;
  personaType: PersonaType;
  name: string;
  appearanceDescription: string;
  personalityDescription: string | null;
  speechStyle: SpeechStyle | null;
  traits: readonly string[];
  backstory: string | null;
  avatarUrl: string | null;
  avatarStatus: string;
}
