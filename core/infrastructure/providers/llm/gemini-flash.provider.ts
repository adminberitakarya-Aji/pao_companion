import {
  LlmProvider,
  LlmGenerateInput,
  LlmGenerateResult,
  LlmMessage,
} from "./llm-provider.interface";

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

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string") {
      throw new Error("Gemini API: respons tidak mengandung teks yang valid");
    }

    return { content: text, providerId: this.providerId };
  }

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

    // HOTFIX 3: Gemini API MEWAJIBKAN `contents` tidak boleh kosong.
    // Kalau SEMUA pesan input cuma system prompt (mis. dipakai
    // MemoryExtractor untuk tugas satu-arah seperti ekstraksi/klasifikasi,
    // bukan chat dua-arah), `contents` akan kosong dan request ditolak
    // Gemini dengan error "contents is not specified". Perbaikan: kalau
    // ini terjadi, masukkan systemInstruction sebagai satu turn "user"
    // supaya request tetap valid.
    if (contents.length === 0 && systemInstruction) {
      contents.push({ role: "user", parts: [{ text: systemInstruction }] });
      systemInstruction = undefined;
    }

    return { systemInstruction, contents };
  }
}
