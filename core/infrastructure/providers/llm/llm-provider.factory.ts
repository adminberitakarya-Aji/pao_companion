import { LlmProvider } from "./llm-provider.interface";
import { GeminiFlashProvider } from "./gemini-flash.provider";
import { ClaudeSonnetProvider } from "./claude-sonnet.provider";

// Alasan pemilihan provider mana yang dipakai — dipakai runtime/provider
// (Phase 2 patch 3) untuk decision logic, dan berguna untuk logging/analytics
// (mis. berapa persen percakapan yang "naik" ke Claude karena momen penting).
export type ProviderSelectionReason = "default" | "fallback" | "premium-moment";

// Factory ini HANYA bertugas membuat instance provider — logika KAPAN
// pakai primary vs fallback/premium ada di core/runtime/provider (Phase 2
// patch 3), BUKAN di sini. Factory tetap "bodoh", cuma tahu cara construct
// tiap provider.
export class LlmProviderFactory {
  private geminiInstance: GeminiFlashProvider | null = null;
  private claudeInstance: ClaudeSonnetProvider | null = null;

  getPrimary(): LlmProvider {
    if (!this.geminiInstance) {
      this.geminiInstance = new GeminiFlashProvider();
    }
    return this.geminiInstance;
  }

  getFallbackOrPremium(): LlmProvider {
    if (!this.claudeInstance) {
      this.claudeInstance = new ClaudeSonnetProvider();
    }
    return this.claudeInstance;
  }

  getByReason(reason: ProviderSelectionReason): LlmProvider {
    if (reason === "default") {
      return this.getPrimary();
    }
    return this.getFallbackOrPremium();
  }
}
