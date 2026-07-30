import {
  LlmProvider,
  LlmGenerateInput,
  LlmGenerateResult,
  LlmMessage,
} from "./llm-provider.interface";

// PRIMARY provider — Gemini Flash, dipilih karena biaya rendah untuk
// volume percakapan harian yang tinggi (lihat diskusi pemilihan provider).
//
// CATATAN: nama model di-hardcode default "gemini-2.5-flash" tapi bisa
// di-override lewat env GEMINI_MODEL — cek dokumentasi Google AI terbaru
// untuk nama model yang tersedia saat Anda deploy, karena penamaan model
// bisa berubah.
export class GeminiFlashProvider implements LlmProvider {
  readonly providerId = "gemini-flash";

  private readonly apiKey: string;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum di-set di .env");
    }
    this.apiKey = apiKey;
    this.model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  }

  async generateReply(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    const { systemInstruction, contents } = this.toGeminiFormat(input.messages);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: systemInstruction
          ? { parts: [{ text: systemInstruction }] }
          : undefined,
        generationConfig: {
          maxOutputTokens: input.maxOutputTokens ?? 500,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Gemini API error (${response.status}): ${errorBody.slice(0, 300)}`,
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      throw new Error("Gemini API: respons tidak mengandung teks yang valid");
    }

    return { content: text, providerId: this.providerId };
  }

  // Gemini tidak punya role "system" di array contents — system prompt
  // dipisah ke field systemInstruction. Role "assistant" di-mapping ke
  // "model" (istilah Gemini untuk balasan AI).
  private toGeminiFormat(messages: LlmMessage[]) {
    let systemInstruction: string | undefined;
    const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemInstruction = systemInstruction
          ? `${systemInstruction}\n\n${msg.content}`
          : msg.content;
        continue;
      }
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    return { systemInstruction, contents };
  }
}
