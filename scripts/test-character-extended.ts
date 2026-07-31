// Script diagnostik manual — TIDAK butuh database atau API key. Jalankan:
//   pnpm test:character-extended
// Menunjukkan perbandingan system prompt SEBELUM vs SESUDAH memakai field
// baru (speechStyle, traits, backstory) dari Phase 3 patch 4.
//
// UPDATE Phase 3 patch 5: buildContext() sekarang menyertakan relationship
// & memories dummy — wajib ada sejak ConversationContext diperluas.

import { Character } from "../core/domain/character/character.entity";
import { PromptBuilder } from "../core/runtime/prompt/prompt-builder.service";
import { ConversationContext } from "../core/runtime/context/conversation-context";

function buildContext(character: Character, latestUserMessage: string): ConversationContext {
  return {
    companion: {
      name: character.name,
      personaType: character.personaType,
      appearanceDescription: character.appearanceDescription,
      personalityDescription: character.personalityDescription,
      speechStyle: character.speechStyle,
      traits: character.traits,
      backstory: character.backstory,
    },
    relationship: { level: 1, levelLabel: "Baru kenal", affectionPoints: 0 },
    memories: [],
    history: [],
    latestUserMessage,
  };
}

function main() {
  const promptBuilder = new PromptBuilder();

  console.log("=== TANPA field baru (seperti companion \"Aya\" yang sudah ada) ===\n");
  const basicCharacter = Character.create({
    personaType: "girlfriend",
    name: "Aya",
    appearanceDescription: "Perempuan muda, rambut hitam sebahu, gaya kasual",
  });
  const basicPrompt = promptBuilder.build(buildContext(basicCharacter, "Halo!"));
  console.log(basicPrompt.messages[0].content);

  console.log("\n\n=== DENGAN field baru (speechStyle, traits, backstory) ===\n");
  const extendedCharacter = Character.create({
    personaType: "girlfriend",
    name: "Aya",
    appearanceDescription: "Perempuan muda, rambut hitam sebahu, gaya kasual",
    speechStyle: "playful",
    traits: ["humoris", "perhatian", "sedikit jahil"],
    backstory:
      "Aya besar di Surabaya, suka banget nonton film komedi, dan selalu ceria walau lagi capek.",
  });
  const extendedPrompt = promptBuilder.build(buildContext(extendedCharacter, "Halo!"));
  console.log(extendedPrompt.messages[0].content);

  console.log("\n\n✅ Bandingkan kedua system prompt di atas — versi kedua harus jauh lebih detail.");
}

main();
