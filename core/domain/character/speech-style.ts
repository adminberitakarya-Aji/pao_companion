// Gaya bicara companion — mempengaruhi nada balasan di Prompt Builder
// (mis. "playful" -> lebih banyak bercanda, "shy" -> lebih pendek/malu-malu).
export type SpeechStyle = "formal" | "casual" | "playful" | "shy" | "confident";

const VALID_SPEECH_STYLES: readonly SpeechStyle[] = [
  "formal",
  "casual",
  "playful",
  "shy",
  "confident",
];

export function isValidSpeechStyle(value: string): value is SpeechStyle {
  return (VALID_SPEECH_STYLES as readonly string[]).includes(value);
}

export const SPEECH_STYLE_LABELS: Record<SpeechStyle, string> = {
  formal: "Formal dan sopan",
  casual: "Santai dan akrab",
  playful: "Suka bercanda dan jahil",
  shy: "Pemalu dan pendiam",
  confident: "Percaya diri dan tegas",
};
