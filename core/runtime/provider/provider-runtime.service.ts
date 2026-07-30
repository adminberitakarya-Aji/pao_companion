import { LlmProviderFactory, ProviderSelectionReason } from "../../infrastructure/providers/llm/llm-provider.factory";
import { LlmGenerateInput, LlmGenerateResult } from "../../infrastructure/providers/llm/llm-provider.interface";
import { Logger } from "../../shared/logger/logger";

export interface GenerateReplyOptions {
  reason?: ProviderSelectionReason;
}

// Tipe ini SENGAJA cuma "Pick" 2 method yang dibutuhkan (bukan import
// LlmProviderFactory secara langsung sebagai tipe parameter) — supaya
// ProviderRuntime bisa diuji pakai factory palsu (fake) di integration
// test tanpa harus benar-benar instantiate GeminiFlashProvider/
// ClaudeSonnetProvider asli (yang butuh API key sungguhan).
export type LlmProviderFactoryPort = Pick<
  LlmProviderFactory,
  "getPrimary" | "getFallbackOrPremium"
>;

export class ProviderRuntime {
  constructor(
    private readonly factory: LlmProviderFactoryPort,
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
      return this.factory.getFallbackOrPremium().generateReply(input);
    }
  }
}
