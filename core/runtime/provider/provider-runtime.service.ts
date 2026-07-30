import { LlmProviderFactory, ProviderSelectionReason } from "../../infrastructure/providers/llm/llm-provider.factory";
import { LlmGenerateInput, LlmGenerateResult } from "../../infrastructure/providers/llm/llm-provider.interface";
import { Logger } from "../../shared/logger/logger";

export interface GenerateReplyOptions {
  // Diisi oleh caller (Conversation Runtime). Untuk sekarang selalu
  // "default" — TODO Phase 3: Timeline Runtime akan mengisi ini dengan
  // "premium-moment" saat mendeteksi milestone hubungan penting.
  reason?: ProviderSelectionReason;
}

// Provider Runtime — SATU-SATUNYA tempat yang memutuskan "pakai provider
// LLM yang mana". Conversation Runtime tidak tahu ada Gemini/Claude sama
// sekali, dia cuma panggil generateReply() di sini.
//
// Logika saat ini:
// - reason "default" -> coba PRIMARY (Gemini Flash) dulu; kalau gagal,
//   otomatis fallback ke Claude Sonnet (reliability)
// - reason "premium-moment" -> langsung pakai Claude Sonnet (tanpa nyoba
//   primary dulu), karena caller sudah eksplisit minta kualitas lebih tinggi
export class ProviderRuntime {
  constructor(
    private readonly factory: LlmProviderFactory,
    private readonly logger: Logger,
  ) {}

  async generateReply(
    input: LlmGenerateInput,
    options: GenerateReplyOptions = {},
  ): Promise<LlmGenerateResult> {
    const reason = options.reason ?? "default";

    if (reason === "premium-moment") {
      this.logger.info("Menggunakan provider premium (momen penting)");
      return this.factory.getFallbackOrPremium().generateReply(input);
    }

    try {
      return await this.factory.getPrimary().generateReply(input);
    } catch (err) {
      this.logger.warn("Primary LLM provider gagal, fallback ke provider kedua", {
        error: err instanceof Error ? err.message : String(err),
      });
      // Fallback HANYA untuk reliability — bukan berarti kualitas jadi
      // "premium" secara sengaja, cuma kebetulan providernya sama dengan
      // yang dipakai untuk premium-moment.
      return this.factory.getFallbackOrPremium().generateReply(input);
    }
  }
}
