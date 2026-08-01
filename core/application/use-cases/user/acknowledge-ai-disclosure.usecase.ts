import { UserRepository } from "../../../domain/user/user.repository";
import { UserNotFoundError } from "../../../domain/user/user.errors";
import { Logger } from "../../../shared/logger/logger";

// Dipanggil saat user menekan "Saya mengerti" di layar onboarding AI
// disclosure (P4-2). Idempotent — panggil berkali-kali aman, timestamp
// pertama tidak ditimpa kalau sudah pernah di-ack (lihat User entity:
// acknowledgeAiDisclosure() memang menimpa, tapi caller di sini sengaja
// tidak memanggil ulang kalau sudah ada, supaya timestamp asli terjaga).
export class AcknowledgeAiDisclosureUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(userId: string): Promise<{ aiDisclosureAckedAt: Date }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    if (!user.hasAcknowledgedAiDisclosure) {
      user.acknowledgeAiDisclosure();
      await this.userRepository.save(user);
      this.logger.info("AI disclosure diakui user", { userId });
    }

    return { aiDisclosureAckedAt: user.aiDisclosureAckedAt as Date };
  }
}
