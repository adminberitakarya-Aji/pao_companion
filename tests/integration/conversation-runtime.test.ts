// Integration test (P2-8) — TIDAK butuh database atau API key sungguhan.
// Pakai in-memory repository + fake LLM provider, supaya bisa jalan di CI
// tanpa dependency eksternal, tapi tetap menguji ALUR SEBENARNYA:
// simpan pesan user -> rakit context -> susun prompt -> panggil provider
// -> simpan balasan -> fallback saat primary gagal.

import { randomUUID } from "crypto";
import { CompanionRepository } from "../../core/domain/companion/companion.repository";
import { Companion } from "../../core/domain/companion/companion.entity";
import { Character } from "../../core/domain/character/character.entity";
import { ConversationRepository } from "../../core/domain/conversation/conversation.repository";
import { Conversation } from "../../core/domain/conversation/conversation.entity";
import {
  MessageRepository,
  RecentMessagesQuery,
} from "../../core/domain/conversation/message.repository";
import { Message } from "../../core/domain/conversation/message.entity";
import { ContextAssembler } from "../../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../../core/runtime/prompt/prompt-builder.service";
import {
  ProviderRuntime,
  LlmProviderFactoryPort,
} from "../../core/runtime/provider/provider-runtime.service";
import { ConversationRuntime } from "../../core/runtime/conversation/conversation-runtime.service";
import {
  LlmProvider,
  LlmGenerateInput,
  LlmGenerateResult,
} from "../../core/infrastructure/providers/llm/llm-provider.interface";
import { ConsoleLogger } from "../../core/shared/logger/logger";

class InMemoryCompanionRepository implements CompanionRepository {
  private store = new Map<string, Companion>();
  seed(companion: Companion) {
    this.store.set(companion.id, companion);
  }
  async findById(id: string) {
    return this.store.get(id) ?? null;
  }
  async findByOwnerId(ownerId: string) {
    for (const c of this.store.values()) if (c.ownerId === ownerId) return c;
    return null;
  }
  async save(companion: Companion) {
    this.store.set(companion.id, companion);
  }
}

class InMemoryConversationRepository implements ConversationRepository {
  private store = new Map<string, Conversation>();
  async findByCompanionId(companionId: string) {
    for (const c of this.store.values()) if (c.companionId === companionId) return c;
    return null;
  }
  async save(conversation: Conversation) {
    this.store.set(conversation.id, conversation);
  }
}

class InMemoryMessageRepository implements MessageRepository {
  private messages: Message[] = [];
  async save(message: Message) {
    this.messages.push(message);
  }
  async findRecent(query: RecentMessagesQuery) {
    return this.messages
      .filter((m) => m.conversationId === query.conversationId)
      .slice(-query.limit);
  }
  async countCompanionMessages(conversationId: string) {
    return this.messages.filter(
      (m) => m.conversationId === conversationId && m.role === "companion",
    ).length;
  }
}

class FakeLlmProvider implements LlmProvider {
  readonly providerId = "fake-provider";
  public lastInput: LlmGenerateInput | null = null;
  constructor(private readonly response: string) {}
  async generateReply(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    this.lastInput = input;
    return { content: this.response, providerId: this.providerId };
  }
}

function buildCompanion(overrides?: { ownerId?: string }) {
  const character = Character.create({
    personaType: "girlfriend",
    name: "Aya",
    appearanceDescription: "Perempuan muda, rambut hitam sebahu, gaya kasual",
  });
  return Companion.create({
    id: randomUUID(),
    ownerId: overrides?.ownerId ?? randomUUID(),
    character,
  });
}

describe("ConversationRuntime (vertical slice Phase 2)", () => {
  it("memproses pesan user end-to-end: simpan pesan, rakit context, panggil provider, simpan balasan", async () => {
    const companionRepository = new InMemoryCompanionRepository();
    const conversationRepository = new InMemoryConversationRepository();
    const messageRepository = new InMemoryMessageRepository();

    const companion = buildCompanion();
    companionRepository.seed(companion);

    const fakeProvider = new FakeLlmProvider("Halo juga! Aku lagi mikirin kamu.");
    const fakeFactory: LlmProviderFactoryPort = {
      getPrimary: () => fakeProvider,
      getFallbackOrPremium: () => fakeProvider,
    };

    const contextAssembler = new ContextAssembler(companionRepository, messageRepository);
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("Test");
    const providerRuntime = new ProviderRuntime(fakeFactory, logger);
    const conversationRuntime = new ConversationRuntime(
      conversationRepository,
      messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
    );

    const result = await conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage: "Halo, lagi ngapain kamu?",
    });

    expect(result.reply).toBe("Halo juga! Aku lagi mikirin kamu.");
    expect(result.providerId).toBe("fake-provider");

    const history = await messageRepository.findRecent({
      conversationId: result.conversationId,
      limit: 10,
    });
    expect(history).toHaveLength(2);
    expect(history[0].role).toBe("user");
    expect(history[0].content).toBe("Halo, lagi ngapain kamu?");
    expect(history[1].role).toBe("companion");
    expect(history[1].content).toBe("Halo juga! Aku lagi mikirin kamu.");

    // Pastikan system prompt benar-benar menyebut nama companion —
    // konfirmasi Context Assembler + Prompt Builder benar-benar tersambung.
    expect(fakeProvider.lastInput?.messages[0].role).toBe("system");
    expect(fakeProvider.lastInput?.messages[0].content).toContain("Aya");
  });

  it("fallback ke provider kedua kalau primary gagal", async () => {
    const companionRepository = new InMemoryCompanionRepository();
    const conversationRepository = new InMemoryConversationRepository();
    const messageRepository = new InMemoryMessageRepository();

    const companion = buildCompanion();
    companionRepository.seed(companion);

    const failingProvider: LlmProvider = {
      providerId: "failing-provider",
      generateReply: async () => {
        throw new Error("Simulasi provider primary down");
      },
    };
    const fallbackProvider = new FakeLlmProvider("Balasan dari fallback");

    const fakeFactory: LlmProviderFactoryPort = {
      getPrimary: () => failingProvider,
      getFallbackOrPremium: () => fallbackProvider,
    };

    const contextAssembler = new ContextAssembler(companionRepository, messageRepository);
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("Test");
    const providerRuntime = new ProviderRuntime(fakeFactory, logger);
    const conversationRuntime = new ConversationRuntime(
      conversationRepository,
      messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
    );

    const result = await conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage: "Test fallback",
    });

    expect(result.providerId).toBe("fake-provider");
    expect(result.reply).toBe("Balasan dari fallback");
  });

  it("percakapan kedua pada companion yang sama memakai Conversation yang sudah ada (bukan bikin baru)", async () => {
    const companionRepository = new InMemoryCompanionRepository();
    const conversationRepository = new InMemoryConversationRepository();
    const messageRepository = new InMemoryMessageRepository();

    const companion = buildCompanion();
    companionRepository.seed(companion);

    const fakeProvider = new FakeLlmProvider("Balasan singkat");
    const fakeFactory: LlmProviderFactoryPort = {
      getPrimary: () => fakeProvider,
      getFallbackOrPremium: () => fakeProvider,
    };

    const contextAssembler = new ContextAssembler(companionRepository, messageRepository);
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("Test");
    const providerRuntime = new ProviderRuntime(fakeFactory, logger);
    const conversationRuntime = new ConversationRuntime(
      conversationRepository,
      messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
    );

    const first = await conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage: "Pesan pertama",
    });
    const second = await conversationRuntime.handleUserMessage({
      companionId: companion.id,
      userMessage: "Pesan kedua",
    });

    expect(second.conversationId).toBe(first.conversationId);

    const history = await messageRepository.findRecent({
      conversationId: first.conversationId,
      limit: 10,
    });
    expect(history).toHaveLength(4);   // 2 pesan user + 2 balasan companion
  });
});
