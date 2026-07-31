import { randomUUID } from "crypto";
import { Companion } from "../../../domain/companion/companion.entity";
import { CompanionRepository } from "../../../domain/companion/companion.repository";
import { CompanionAlreadyExistsError } from "../../../domain/companion/companion.errors";
import { Character } from "../../../domain/character/character.entity";
import { AvatarGenerationQueue } from "../../services/avatar-generation-queue.service";
import { Logger } from "../../../shared/logger/logger";
import { CreateCompanionInput, CompanionResult } from "../../dto/companion.dto";

export class CreateCompanionUseCase {
  constructor(
    private readonly companionRepository: CompanionRepository,
    private readonly avatarQueue: AvatarGenerationQueue,
    private readonly logger: Logger,
  ) {}

  async execute(input: CreateCompanionInput): Promise<CompanionResult> {
    const existing = await this.companionRepository.findByOwnerId(input.ownerId);
    if (existing) {
      throw new CompanionAlreadyExistsError();
    }

    const character = Character.create({
      personaType: input.personaType,
      name: input.name,
      appearanceDescription: input.appearanceDescription,
      personalityDescription: input.personalityDescription,
      speechStyle: input.speechStyle,
      traits: input.traits,
      backstory: input.backstory,
    });

    const companion = Companion.create({
      id: randomUUID(),
      ownerId: input.ownerId,
      character,
    });

    await this.companionRepository.save(companion);
    this.logger.info("Companion created", {
      companionId: companion.id,
      ownerId: companion.ownerId,
      personaType: character.personaType,
    });

    companion.markAvatarGenerating();
    await this.companionRepository.save(companion);
    await this.avatarQueue.enqueueAvatarGeneration({
      companionId: companion.id,
      appearanceDescription: character.appearanceDescription,
    });

    return this.toResult(companion);
  }

  private toResult(companion: Companion): CompanionResult {
    const c = companion.character;
    return {
      id: companion.id,
      personaType: c.personaType,
      name: c.name,
      appearanceDescription: c.appearanceDescription,
      personalityDescription: c.personalityDescription,
      speechStyle: c.speechStyle,
      traits: c.traits,
      backstory: c.backstory,
      avatarUrl: c.avatarUrl,
      avatarStatus: c.avatarStatus,
    };
  }
}
