// Interface — implementasi asli (BullMQ + fal.ai provider) menyusul di
// Phase 2/8. Untuk sekarang use-case tetap bisa jalan end-to-end dengan
// implementasi stub (lihat NoopAvatarGenerationQueue di infrastructure),
// supaya endpoint create companion sudah bisa dites tanpa menunggu
// integrasi fal.ai selesai.
export interface AvatarGenerationQueue {
  enqueueAvatarGeneration(input: {
    companionId: string;
    appearanceDescription: string;
  }): Promise<void>;
}

export const AVATAR_GENERATION_QUEUE = Symbol("AVATAR_GENERATION_QUEUE");
