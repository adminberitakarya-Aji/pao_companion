import { LlmGenerateInput, LlmMessage } from "../../infrastructure/providers/llm/llm-provider.interface";
import { ConversationContext } from "../context/conversation-context";
import { PersonaType } from "../../domain/character/character.entity";
import { SPEECH_STYLE_LABELS } from "../../domain/character/speech-style";

export class PromptBuilder {
  build(context: ConversationContext): LlmGenerateInput {
    const systemPrompt = this.buildSystemPrompt(context);

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

  private buildSystemPrompt(context: ConversationContext): string {
    const { companion, relationship, memories } = context;
    const personaLabel = this.personaLabel(companion.personaType);

    const parts: string[] = [];

    parts.push(
      `Kamu berperan sebagai ${companion.name}, seorang ${personaLabel} yang ` +
        `penyayang, perhatian, dan hadir secara emosional untuk pengguna yang ` +
        `sedang berbicara denganmu.`,
    );

    parts.push(`Tampilan/karaktermu: ${companion.appearanceDescription}`);

    if (companion.personalityDescription) {
      parts.push(`Kepribadianmu (ringkasan): ${companion.personalityDescription}`);
    }

    if (companion.speechStyle) {
      parts.push(`Gaya bicaramu: ${SPEECH_STYLE_LABELS[companion.speechStyle]}`);
    }

    if (companion.traits.length > 0) {
      parts.push(`Sifat-sifatmu: ${companion.traits.join(", ")}`);
    }

    if (companion.backstory) {
      parts.push(`Latar belakangmu: ${companion.backstory}`);
    }

    // --- BARU Phase 3 patch 5: Relationship & Memory ---
    parts.push(
      `Tingkat kedekatanmu dengan user saat ini: Level ${relationship.level} — ${relationship.levelLabel}. ` +
        `Sesuaikan kehangatan dan tingkat keakraban balasanmu dengan level ini: semakin ` +
        `tinggi levelnya, semakin akrab, hangat, dan personal gaya bicaramu boleh terasa. ` +
        `Di level rendah, tetap ramah tapi jangan terlalu intim/berlebihan.`,
    );

    if (memories.length > 0) {
      parts.push(
        "Fakta yang kamu ingat tentang user dari percakapan sebelumnya:\n" +
          memories.map((m) => `- ${m}`).join("\n") +
          "\n\nGunakan fakta ini secara NATURAL kalau relevan dengan topik saat ini — " +
          "jangan menyebutkan semuanya sekaligus atau terkesan seperti membacakan daftar/catatan.",
      );
    }
    // --- akhir bagian baru ---

    parts.push(
      [
        "Panduan penting yang HARUS selalu kamu ikuti:",
        "- Balas dengan hangat, konsisten dengan kepribadian, gaya bicara, dan level kedekatan di atas — terasa personal, bukan asisten generik.",
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
