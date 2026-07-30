import { AvatarGenerationQueue } from "../../application/services/avatar-generation-queue.service";
import { Logger } from "../../shared/logger/logger";

// Implementasi SEMENTARA — belum benar-benar antre job atau panggil fal.ai.
// Dipakai supaya endpoint create companion bisa dites end-to-end sekarang,
// tanpa menunggu integrasi BullMQ + fal.ai provider selesai (menyusul di
// Phase 2/8). GANTI implementasi ini saat queue system sungguhan dibangun —
// jangan biarkan ini terpakai di production.
export class NoopAvatarGenerationQueue implements AvatarGenerationQueue {
  constructor(private readonly logger: Logger) {}

  async enqueueAvatarGeneration(input: {
    companionId: string;
    appearanceDescription: string;
  }): Promise<void> {
    this.logger.warn(
      "NoopAvatarGenerationQueue dipakai — avatar TIDAK benar-benar di-generate. " +
        "Ganti dengan implementasi asli (BullMQ + fal.ai) sebelum production.",
      { companionId: input.companionId },
    );
  }
}
