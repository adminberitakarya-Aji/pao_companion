import {
  LlmProvider,
  LlmGenerateInput,
  LlmGenerateResult,
  LlmMessage,
} from "./llm-provider.interface";

// FALLBACK / PREMIUM provider — dipakai saat Gemini Flash gagal (reliability)
// ATAU saat Timeline Runtime menandai momen penting (milestone hubungan) —
// lihat catatan desain routing di ROADMAP.md Phase 3.
//
// CATATAN: nama model di-hardcode default "claude-sonnet-4-5" tapi bisa
// di-override lewat env ANTHROPIC_MODEL — cek https://docs.claude.com
// untuk model string terbaru yang tersedia saat Anda deploy.
export class ClaudeSonnetProvider implements LlmProvider {
  readonly providerId = "claude-sonnet";

  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY belum di-set di .env");
    }
    this.apiKey = apiKey;
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
  }

  async generateReply(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    const { system, messages } = this.toClaudeFormat(input.messages);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: input.maxOutputTokens ?? 500,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Claude API error (${response.status}): ${errorBody.slice(0, 300)}`,
      );
    }

    const data = await response.json();
    const textBlock = data?.content?.find((block: { type: string }) => block.type === "text");

    if (!textBlock || typeof textBlock.text !== "string") {
      throw new Error("Claude API: respons tidak mengandung teks yang valid");
    }

    return { content: textBlock.text, providerId: this.providerId };
  }

  // Claude API punya field "system" terpisah (mirip Gemini), messages
  // hanya berisi role "user"/"assistant".
  private toClaudeFormat(messages: LlmMessage[]) {
    let system: string | undefined;
    const claudeMessages: { role: "user" | "assistant"; content: string }[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        system = system ? `${system}\n\n${msg.content}` : msg.content;
        continue;
      }
      claudeMessages.push({ role: msg.role, content: msg.content });
    }

    return { system, messages: claudeMessages };
  }
}
