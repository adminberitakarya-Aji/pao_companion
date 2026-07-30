import { PersonaType } from "../../domain/character/character.entity";

export interface CreateCompanionInput {
  ownerId: string;
  personaType: PersonaType;
  name: string;
  appearanceDescription: string;
  personalityDescription?: string;
}

export interface CompanionResult {
  id: string;
  personaType: PersonaType;
  name: string;
  appearanceDescription: string;
  personalityDescription: string | null;
  avatarUrl: string | null;
  avatarStatus: string;
}
