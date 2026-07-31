import {
  PrismaClient,
  PersonaType as PrismaPersonaType,
  AvatarStatus as PrismaAvatarStatus,
  SpeechStyle as PrismaSpeechStyle,
} from "@prisma/client";
import { Companion } from "../../../domain/companion/companion.entity";
import { CompanionRepository } from "../../../domain/companion/companion.repository";
import { Character, PersonaType } from "../../../domain/character/character.entity";
import { AvatarStatus } from "../../../domain/character/avatar-status";
import { SpeechStyle } from "../../../domain/character/speech-style";

const toDomainPersonaType = (value: PrismaPersonaType): PersonaType =>
  value === "GIRLFRIEND" ? "girlfriend" : "boyfriend";

const toPrismaPersonaType = (value: PersonaType): PrismaPersonaType =>
  value === "girlfriend" ? "GIRLFRIEND" : "BOYFRIEND";

const toDomainAvatarStatus = (value: PrismaAvatarStatus): AvatarStatus =>
  value.toLowerCase() as AvatarStatus;

const toPrismaAvatarStatus = (value: AvatarStatus): PrismaAvatarStatus =>
  value.toUpperCase() as PrismaAvatarStatus;

const toDomainSpeechStyle = (value: PrismaSpeechStyle | null): SpeechStyle | null =>
  value ? (value.toLowerCase() as SpeechStyle) : null;

const toPrismaSpeechStyle = (value: SpeechStyle | null): PrismaSpeechStyle | null =>
  value ? (value.toUpperCase() as PrismaSpeechStyle) : null;

export class PrismaCompanionRepository implements CompanionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Companion | null> {
    const record = await this.prisma.companion.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByOwnerId(ownerId: string): Promise<Companion | null> {
    const record = await this.prisma.companion.findUnique({ where: { ownerId } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async save(companion: Companion): Promise<void> {
    const c = companion.character;
    await this.prisma.companion.upsert({
      where: { id: companion.id },
      create: {
        id: companion.id,
        ownerId: companion.ownerId,
        personaType: toPrismaPersonaType(c.personaType),
        name: c.name,
        appearanceDescription: c.appearanceDescription,
        personalityDescription: c.personalityDescription,
        speechStyle: toPrismaSpeechStyle(c.speechStyle),
        traits: [...c.traits],
        backstory: c.backstory,
        avatarUrl: c.avatarUrl,
        avatarStatus: toPrismaAvatarStatus(c.avatarStatus),
      },
      update: {
        name: c.name,
        appearanceDescription: c.appearanceDescription,
        personalityDescription: c.personalityDescription,
        speechStyle: toPrismaSpeechStyle(c.speechStyle),
        traits: [...c.traits],
        backstory: c.backstory,
        avatarUrl: c.avatarUrl,
        avatarStatus: toPrismaAvatarStatus(c.avatarStatus),
        // personaType SENGAJA tidak di-update — immutable sesuai desain domain
      },
    });
  }

  private toDomain(record: {
    id: string;
    ownerId: string;
    personaType: PrismaPersonaType;
    name: string;
    appearanceDescription: string;
    personalityDescription: string | null;
    speechStyle: PrismaSpeechStyle | null;
    traits: string[];
    backstory: string | null;
    avatarUrl: string | null;
    avatarStatus: PrismaAvatarStatus;
    createdAt: Date;
  }): Companion {
    const character = Character.create({
      personaType: toDomainPersonaType(record.personaType),
      name: record.name,
      appearanceDescription: record.appearanceDescription,
      personalityDescription: record.personalityDescription,
      speechStyle: toDomainSpeechStyle(record.speechStyle),
      traits: record.traits,
      backstory: record.backstory,
      avatarUrl: record.avatarUrl,
      avatarStatus: toDomainAvatarStatus(record.avatarStatus),
    });

    return Companion.create({
      id: record.id,
      ownerId: record.ownerId,
      character,
      createdAt: record.createdAt,
    });
  }
}
