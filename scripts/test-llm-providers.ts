// Script diagnostik manual — jalankan dengan:
//   pnpm test:llm
// Tujuannya cek API key Gemini & Claude valid dan bisa dapat respons,
// SEBELUM disambungkan ke runtime percakapan lengkap (Phase 2 patch 3).
// Bukan bagian dari aplikasi production — aman dihapus nanti.

import { GeminiFlashProvider } from "../core/infrastructure/providers/llm/gemini-flash.provider";
import { ClaudeSonnetProvider } from "../core/infrastructure/providers/llm/claude-sonnet.provider";

async function testProvider(name: string, fn: () => Promise<void>) {
  console.log(`\n--- Testing ${name} ---`);
  try {
    await fn();
    console.log(`✅ ${name} OK`);
  } catch (err) {
    console.error(`❌ ${name} FAILED:`, err instanceof Error ? err.message : err);
  }
}

async function main() {
  await testProvider("Gemini Flash", async () => {
    const provider = new GeminiFlashProvider();
    const result = await provider.generateReply({
      messages: [
        { role: "system", content: "Kamu adalah asisten yang ramah. Jawab singkat." },
        { role: "user", content: "Halo, siapa namamu?" },
      ],
      maxOutputTokens: 100,
    });
    console.log("Response:", result.content);
  });

  await testProvider("Claude Sonnet", async () => {
    const provider = new ClaudeSonnetProvider();
    const result = await provider.generateReply({
      messages: [
        { role: "system", content: "Kamu adalah asisten yang ramah. Jawab singkat." },
        { role: "user", content: "Halo, siapa namamu?" },
      ],
      maxOutputTokens: 100,
    });
    console.log("Response:", result.content);
  });
}

main();
