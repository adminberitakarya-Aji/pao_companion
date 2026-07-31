// Integration test (P3-6) — simulasi 15 percakapan berturut-turut dengan
// Memory + Relationship + Timeline SEMUA tersambung (bukan versi ringan
// seperti tests/integration/conversation-runtime.test.ts dari Phase 2).
// TIDAK butuh database atau API key sungguhan — semua pakai in-memory
// repository + fake LLM provider, supaya jalan cepat & deterministik di CI.

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
import { MemoryRepository } from "../../core/domain/memory/memory.repository";
import { Memory } from "../../core/domain/memory/memory.entity";
import { RelationshipRepository } from "../../core/domain/relationship/relationship.repository";
import { Relationship } from "../../core/domain/relationship/relationship.entity";
import { TimelineEventRepository } from "../../core/domain/timeline/timeline-event.repository";
import { TimelineEvent } from "../../core/domain/timeline/timeline-event.entity";
import { TimelineEventType } from "../../core/domain/timeline/timeline-event-type";
import { ContextAssembler } from "../../core/runtime/context/context-assembler.service";
import { PromptBuilder } from "../../core/runtime/prompt/prompt-builder.service";
import {
  ProviderRuntime,
  LlmProviderFactoryPort,
} from "../../core/runtime/provider/provider-runtime.service";
import { ConversationRuntime } from "../../core/runtime/conversation/conversation-runtime.service";
import { RelationshipRuntime } from "../../core/runtime/relationship/relationship-runtime.service";
import { RelationshipScorer } from "../../core/runtime/relationship/relationship-scorer.service";
import { TimelineRuntime } from "../../core/runtime/timeline/timeline-runtime.service";
import { MemoryRuntime } from "../../core/runtime/memory/memory-runtime.service";
import { MemoryExtractor } from "../../core/runtime/memory/memory-extractor.service";
import {
  LlmProvider,
  LlmGenerateInput,
  LlmGenerateResult,
} from "../../core/infrastructure/providers/llm/llm-provider.interface";
import { ConsoleLogger } from "../../core/shared/logger/logger";

// ---------- In-memory fakes ----------

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
}

class InMemoryMemoryRepository implements MemoryRepository {
  private items: Memory[] = [];
  async save(memory: Memory) {
    this.items.push(memory);
  }
  async findByCompanionId(companionId: string, limit: number) {
    const filtered = this.items.filter((m) => m.companionId === companionId);
    return [...filtered].reverse().slice(0, limit);
  }
}

class InMemoryRelationshipRepository implements RelationshipRepository {
  private store = new Map<string, Relationship>();
  async findByCompanionId(companionId: string) {
    for (const r of this.store.values()) if (r.companionId === companionId) return r;
    return null;
  }
  async save(relationship: Relationship) {
    this.store.set(relationship.id, relationship);
  }
}

class InMemoryTimelineEventRepository implements TimelineEventRepository {
  private items: TimelineEvent[] = [];
  async save(event: TimelineEvent) {
    this.items.push(event);
  }
  async findByCompanionId(companionId: string, limit: number) {
    return this.items
      .filter((e) => e.companionId === companionId)
      .slice(-limit)
      .reverse();
  }
  async hasEventOfType(companionId: string, eventType: TimelineEventType) {
    return this.items.some((e) => e.companionId === companionId && e.eventType === eventType);
  }
}

// Fake provider percakapan — melacak SEMUA system prompt yang pernah
// dikirim ke sini, supaya bisa dicek konsistensinya di akhir.
class FakeChatProvider implements LlmProvider {
  public readonly capturedSystemPrompts: string[] = [];
  constructor(
    public readonly providerId: string,
    private readonly response: string,
  ) {}
  async generateReply(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    this.capturedSystemPrompts.push(input.messages[0].content);
    return { content: this.response, providerId: this.providerId };
  }
}

// Fake provider extraction — selalu balas 1 fakta (deterministik), supaya
// pertumbuhan jumlah Memory bisa diprediksi persis di assertion.
class FakeMemoryExtractionProvider implements Pick<LlmProvider, "generateReply"> {
  async generateReply(): Promise<LlmGenerateResult> {
    return {
      content: JSON.stringify(["Fakta contoh yang diekstrak dari pesan ini"]),
      providerId: "fake-extraction",
    };
  }
}

function buildCompanion(): Companion {
  const character = Character.create({
    personaType: "girlfriend",
    name: "Aya",
    appearanceDescription: "Perempuan muda, rambut hitam sebahu, gaya kasual",
    speechStyle: "playful",
    traits: ["humoris", "perhatian"],
  });
  return Companion.create({ id: randomUUID(), ownerId: randomUUID(), character });
}

// Pesan cukup panjang supaya konsisten dapat bonus poin maksimal dari
// RelationshipScorer (>= 250 karakter -> lengthBonus mentok di 5) —
// supaya level up TERJAMIN terjadi dalam 15 putaran, menguji jalur
// premium-moment (bukan cuma jalur default).
function buildLongMessage(index: number): string {
  const filler = "kata ".repeat(60);
  return `Pesan ke-${index}: ${filler}`;
}

describe("Phase 3 — konsistensi karakter dalam percakapan panjang (Memory + Relationship + Timeline)", () => {
  it("mensimulasikan 15 percakapan berturut dan menjaga semua sub-sistem konsisten", async () => {
    const companionRepository = new InMemoryCompanionRepository();
    const conversationRepository = new InMemoryConversationRepository();
    const messageRepository = new InMemoryMessageRepository();
    const memoryRepository = new InMemoryMemoryRepository();
    const relationshipRepository = new InMemoryRelationshipRepository();
    const timelineEventRepository = new InMemoryTimelineEventRepository();

    const companion = buildCompanion();
    companionRepository.seed(companion);

    const defaultProvider = new FakeChatProvider("fake-default", "Balasan biasa dari provider default");
    const premiumProvider = new FakeChatProvider("fake-premium", "Balasan spesial dari provider premium");
    const fakeFactory: LlmProviderFactoryPort = {
      getPrimary: () => defaultProvider,
      getFallbackOrPremium: () => premiumProvider,
    };

    const contextAssembler = new ContextAssembler(
      companionRepository,
      messageRepository,
      memoryRepository,
      relationshipRepository,
    );
    const promptBuilder = new PromptBuilder();
    const logger = new ConsoleLogger("Test");
    const providerRuntime = new ProviderRuntime(fakeFactory, logger);
    const relationshipRuntime = new RelationshipRuntime(
      relationshipRepository,
      new RelationshipScorer(),
      logger,
    );
    const timelineRuntime = new TimelineRuntime(timelineEventRepository, logger);
    const memoryRuntime = new MemoryRuntime(
      memoryRepository,
      new MemoryExtractor(new FakeMemoryExtractionProvider(), logger),
      logger,
    );

    const conversationRuntime = new ConversationRuntime(
      conversationRepository,
      messageRepository,
      contextAssembler,
      promptBuilder,
      providerRuntime,
      logger,
      relationshipRuntime,
      timelineRuntime,
      memoryRuntime,
    );

    const ROUNDS = 15;
    const results = [];
    for (let i = 1; i <= ROUNDS; i++) {
      const result = await conversationRuntime.handleUserMessage({
        companionId: companion.id,
        userMessage: buildLongMessage(i),
      });
      results.push(result);
    }

    // 1. Milestone "percakapan pertama" HANYA tercatat SEKALI meski 15 putaran.
    const allTimelineEvents = await timelineEventRepository.findByCompanionId(companion.id, 100);
    const firstConvoCount = allTimelineEvents.filter(
      (e) => e.eventType === "first_conversation",
    ).length;
    expect(firstConvoCount).toBe(1);

    // 2. Jumlah milestone "level up" HARUS sama persis dengan jumlah
    //    hasil yang leveledUp=true — tidak ada yang terlewat atau dobel.
    const leveledUpResults = results.filter((r) => r.leveledUp);
    const levelUpEvents = allTimelineEvents.filter(
      (e) => e.eventType === "relationship_level_up",
    );
    expect(levelUpEvents.length).toBe(leveledUpResults.length);
    expect(leveledUpResults.length).toBeGreaterThan(0); // pastikan skenario ini benar-benar teruji

    // 3. Setiap kali leveledUp, balasan HARUS dari provider premium —
    //    setiap kali TIDAK leveledUp, HARUS dari provider default.
    for (const r of results) {
      if (r.leveledUp) {
        expect(r.providerId).toBe("fake-premium");
      } else {
        expect(r.providerId).toBe("fake-default");
      }
    }

    // 4. Memory bertambah PERSIS 1 per pertukaran (fake extractor deterministik).
    const memories = await memoryRepository.findByCompanionId(companion.id, 100);
    expect(memories.length).toBe(ROUNDS);

    // 5. KONSISTENSI KARAKTER — setiap system prompt yang benar-benar
    //    dikirim ke LLM (baik ke provider default MAUPUN premium) harus
    //    selalu menyebut nama companion & jenis persona. Companion TIDAK
    //    BOLEH "amnesia" (lupa siapa dirinya) di percakapan manapun.
    const allSystemPrompts = [
      ...defaultProvider.capturedSystemPrompts,
      ...premiumProvider.capturedSystemPrompts,
    ];
    expect(allSystemPrompts.length).toBe(ROUNDS);
    for (const prompt of allSystemPrompts) {
      expect(prompt).toContain("Aya");
      expect(prompt).toContain("girlfriend");
      expect(prompt).toContain("Level"); // info relationship level selalu ada
    }

    // 6. History percakapan tersimpan lengkap: 2 pesan (user + companion) per putaran.
    const conversation = await conversationRepository.findByCompanionId(companion.id);
    const history = await messageRepository.findRecent({
      conversationId: conversation!.id,
      limit: 1000,
    });
    expect(history).toHaveLength(ROUNDS * 2);
  });
});
