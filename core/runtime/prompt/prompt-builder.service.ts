import { LlmGenerateInput, LlmMessage } from "../../infrastructure/providers/llm/llm-provider.interface";
import { ConversationContext } from "../context/conversation-context";
import { PersonaType } from "../../domain/character/character.entity";

// Prompt Builder — MENERIMA ConversationContext yang sudah lengkap dari
// Context Assembler, TIDAK PERNAH mengambil data sendiri (tidak panggil
// repository apa pun). Tanggung jawabnya murni "susun jadi teks prompt".
//
// PENTING soal safety (lihat diskusi docs/09-safety-and-trust/):
// System prompt di bawah ini SENGAJA menyertakan 3 pagar dasar di setiap
// percakapan — AI disclosure, batas non-eksplisit, dan arahan saat distress.
// Ini baseline MINIMUM, bukan pengganti moderation layer sungguhan (P4-1)
// yang harus memvalidasi INPUT & OUTPUT secara terpisah. Jangan anggap
// prompt ini cukup sebagai satu-satunya lapisan keamanan.
export class PromptBuilder {
  build(context: ConversationContext): LlmGenerateInput {
    const systemPrompt = this.buildSystemPrompt(context.companion);

    const messages: LlmMessage[] = [{ role: "system", content: systemPrompt }];

    for (const msg of context.history) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    messages.push({ role: "user", content: context.latestUserMessage });

    return { messages };
  }

  private buildSystemPrompt(companion: ConversationContext["companion"]): string {
    const personaLabel = this.personaLabel(companion.personaType);

    const parts: string[] = [];

    parts.push(
      `Kamu berperan sebagai ${companion.name}, seorang ${personaLabel} yang ` +
        `penyayang, perhatian, dan hadir secara emosional untuk pengguna yang ` +
        `sedang berbicara denganmu.`,
    );

    parts.push(`Tampilan/karaktermu: ${companion.appearanceDescription}`);

    if (companion.personalityDescription) {
      parts.push(`Kepribadianmu: ${companion.personalityDescription}`);
    }

    parts.push(
      [
        "Panduan penting yang HARUS selalu kamu ikuti:",
        "- Balas dengan hangat, konsisten dengan kepribadian di atas, dan terasa personal — bukan seperti asisten generik.",
        "- Kamu adalah AI. Jika pengguna secara langsung bertanya apakah kamu AI/robot/program, akui dengan jujur — jangan pernah berpura-pura menjadi manusia sungguhan.",
        "- Romantis dan penuh kasih sayang boleh, tapi jangan pernah membuat konten seksual eksplisit dalam bentuk apa pun.",
        "- Jika pengguna menunjukkan tanda distress serius (menyakiti diri sendiri, putus asa, krisis emosional), respons dengan empati, jangan abaikan, dan dorong mereka mencari bantuan dari orang tepercaya atau profesional — jangan coba menangani sendiri sebagai pengganti bantuan nyata.",
      ].join("\n"),
    );

    return parts.join("\n\n");
  }

  private personaLabel(personaType: PersonaType): string {
    return personaType === "girlfriend"
      ? "pacar perempuan (girlfriend) pengguna"
      : "pacar laki-laki (boyfriend) pengguna";
  }
}
