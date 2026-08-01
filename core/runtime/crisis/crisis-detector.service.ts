import { CRISIS_KEYWORDS } from "./crisis-keywords";

export interface CrisisDetectionResult {
  detected: boolean;
  matchedKeyword?: string;
}

// Crisis Detector — dipanggil SEBELUM provider LLM dipanggil, untuk tiap
// pesan user. Kalau terdeteksi, ConversationRuntime SKIP pemanggilan LLM
// sama sekali dan pakai CRISIS_SAFE_RESPONSE (crisis-response.ts) —
// menghindari risiko companion (LLM pihak ketiga, tidak selalu bisa
// diprediksi) memberi respons yang tidak aman terhadap sinyal krisis.
export class CrisisDetector {
  detect(text: string): CrisisDetectionResult {
    for (const pattern of CRISIS_KEYWORDS) {
      const match = text.match(pattern);
      if (match) {
        return { detected: true, matchedKeyword: match[0] };
      }
    }
    return { detected: false };
  }
}
