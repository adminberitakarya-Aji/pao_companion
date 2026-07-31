import { LlmProvider } from "../../infrastructure/providers/llm/llm-provider.interface";
import { Logger } from "../../shared/logger/logger";

export interface ExtractMemoriesInput {
  userMessage: string;
  companionReply: string;
}

// Memory Extractor — memanggil LLM dengan prompt KHUSUS (bukan prompt
// chat biasa) untuk menyaring fakta personal dari SATU pertukaran pesan.
// Tipe parameter "Pick<LlmProvider, ...>" — sama seperti pola ProviderRuntime
// — supaya bisa diuji dengan fake provider tanpa API key sungguhan.
export class MemoryExtractor {
  constructor(
    private readonly provider: Pick<LlmProvider, "generateReply">,
    private readonly logger: Logger,
  ) {}

  async extract(input: ExtractMemoriesInput): Promise<string[]> {
    const extractionPrompt = this.buildExtractionPrompt(input);

    try {
      const result = await this.provider.generateReply({
        messages: [{ role: "system", content: extractionPrompt }],
        maxOutputTokens: 300,
      });
      return this.parseFacts(result.content);
    } catch (err) {
      // Extraction GAGAL tidak boleh menggagalkan percakapan utama —
      // cukup log dan kembalikan array kosong. Chat tetap jalan normal,
      // cuma tidak ada memory baru dari pertukaran ini.
      this.logger.warn("Memory extraction gagal, dilewati", {
        error: err instanceof Error ? err.message : String(err),
      });
      return [];
    }
  }

  private buildExtractionPrompt(input: ExtractMemoriesInput): string {
    return [
      "Tugas kamu: baca satu pertukaran pesan berikut antara USER dan COMPANION (AI),",
      "lalu ekstrak fakta PERSONAL tentang USER yang layak diingat jangka panjang",
      "(contoh: nama, pekerjaan, kota tempat tinggal, hobi, preferensi, kejadian penting).",
      "",
      "ATURAN:",
      "- Jangan simpulkan/tebak hal yang tidak eksplisit disebutkan.",
      "- Jangan sertakan basa-basi atau emosi sesaat (mis. \"user sedang senang\").",
      "- Jika tidak ada fakta baru yang layak diingat, kembalikan array kosong.",
      "- WAJIB balas HANYA dalam format JSON array of string, tanpa teks lain, tanpa markdown code block.",
      "  Contoh: [\"User bekerja sebagai guru SD\", \"User tinggal di Semarang\"]",
      "",
      `USER: ${input.userMessage}`,
      `COMPANION: ${input.companionReply}`,
    ].join("\n");
  }

  private parseFacts(rawResponse: string): string[] {
    try {
      const cleaned = rawResponse.trim().replace(/^```json\s*|```$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
    } catch {
      this.logger.warn("Memory extraction: gagal parse respons JSON, dilewati", {
        rawResponse: rawResponse.slice(0, 200),
      });
      return [];
    }
  }
}
