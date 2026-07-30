import { CompanionRepository } from "../../../domain/companion/companion.repository";
import { CompanionNotFoundError } from "../../../domain/companion/companion.errors";
import { Companion } from "../../../domain/companion/companion.entity";
import { CompanionResult } from "../../dto/companion.dto";

export class GetMyCompanionUseCase {
  constructor(private readonly companionRepository: CompanionRepository) {}

  async execute(ownerId: string): Promise<CompanionResult> {
    const companion = await this.companionRepository.findByOwnerId(ownerId);
    if (!companion) {
      throw new CompanionNotFoundError("Companion belum dibuat untuk user ini");
    }
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
      avatarUrl: c.avatarUrl,
      avatarStatus: c.avatarStatus,
    };
  }
}
