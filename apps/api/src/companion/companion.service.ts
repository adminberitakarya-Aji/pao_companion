import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { PrismaCompanionRepository } from "../../../../core/infrastructure/database/repositories/prisma-companion.repository";
import { NoopAvatarGenerationQueue } from "../../../../core/infrastructure/queue/noop-avatar-generation-queue";
import { CreateCompanionUseCase } from "../../../../core/application/use-cases/companion/create-companion.usecase";
import { GetMyCompanionUseCase } from "../../../../core/application/use-cases/companion/get-my-companion.usecase";
import { ConsoleLogger } from "../../../../core/shared/logger/logger";
import { CreateCompanionInput, CompanionResult } from "../../../../core/application/dto/companion.dto";

// Sama seperti AuthService — HANYA wiring, business logic ada di
// core/application & core/domain.
@Injectable()
export class CompanionService {
  private readonly createCompanionUseCase: CreateCompanionUseCase;
  private readonly getMyCompanionUseCase: GetMyCompanionUseCase;

  constructor(prisma: PrismaService) {
    const companionRepository = new PrismaCompanionRepository(prisma);
    const logger = new ConsoleLogger("Companion");
    // TODO Phase 2/8: ganti NoopAvatarGenerationQueue dengan implementasi
    // BullMQ + fal.ai provider yang sesungguhnya.
    const avatarQueue = new NoopAvatarGenerationQueue(logger);

    this.createCompanionUseCase = new CreateCompanionUseCase(
      companionRepository,
      avatarQueue,
      logger,
    );
    this.getMyCompanionUseCase = new GetMyCompanionUseCase(companionRepository);
  }

  async create(input: CreateCompanionInput): Promise<CompanionResult> {
    return this.createCompanionUseCase.execute(input);
  }

  async getMine(ownerId: string): Promise<CompanionResult> {
    return this.getMyCompanionUseCase.execute(ownerId);
  }
}
