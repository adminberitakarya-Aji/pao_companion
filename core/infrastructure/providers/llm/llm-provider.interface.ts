// Kontrak SATU-SATUNYA yang boleh dikenal oleh core/runtime/provider.
// Semua adapter LLM (Gemini, Claude, dst) HARUS implement ini — supaya
// runtime tidak perlu tahu detail SDK/REST API tiap provider.

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmGenerateInput {
  messages: LlmMessage[];
  maxOutputTokens?: number;
}

export interface LlmGenerateResult {
  content: string;
  providerId: string;   // untuk logging/debugging — provider mana yang benar-benar merespons
}

export interface LlmProvider {
  readonly providerId: string;
  generateReply(input: LlmGenerateInput): Promise<LlmGenerateResult>;
}
