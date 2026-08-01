// Integration test (P4) — TIDAK butuh database atau API key sungguhan,
// sama seperti conversation-runtime.test.ts. Menguji Content Moderation
// (P4-1), Crisis Detection (P4-4), AI Disclosure reminder (P4-2), dan
// verifikasi usia (P4-3) lewat entity User langsung.

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
import { ContentModerator } from "../../core/runtime/moderation/content-moderator.service";
import { CrisisDetector } from "../../core/runtime/crisis/crisis-detector.service";
import { CRISIS_SAFE_RESPONSE_ID } from "../../core/runtime/crisis/crisis-response";
import { AiDisclosureReminder } from "../../core/runtime/disclosure/ai-disclosure.service";
import { ModerationFlagRepository } from "../../core/domain/moderation/moderation-flag.repository";
import { ModerationFlag } from "../../core/domain/moderation/moderation-flag.entity";
import { BlockedContentError } from "../../core/domain/moderation/moderation.errors";
import { CrisisEventRepository } from "../../core/domain/crisis/crisis-event.repository";
import { CrisisEvent } from "../../core/domain/crisis/crisis-event.entity";
import { User } from "../../core/domain/user/user.entity";
import { UnderageRegistrationError } from "../../core/domain/user/user.errors";

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
  public messages: Message[] = [];
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

class InMemoryModerationFlagRepository implements ModerationFlagRepository {
  public flags: ModerationFlag[] = [];
  async save(flag: ModerationFlag) {
    this.flags.push(flag);
  }
  async findByCompanionId(companionId: string, limit: number) {
    return this.flags.filter((f) => f.companionId === companionId).slice(0, limit);
  }
}

class InMemoryCrisisEventRepository implements CrisisEventRepository {
  public events: CrisisEvent[] = [];
  async save(event: CrisisEvent) {
    this.events.push(event);
  }
  async findByCompanionId(companionId: string, limit: number) {
    return this.events.filter((e) => e.companionId === companionId).slice(0, limit);
  }
}

class FakeLlmProvider implements LlmProvider {
  readonly providerId = "fake-provider";
  public callCount = 0;
  public lastInput: LlmGenerateInput | null = null;
  constructor(private readonly response: string) {}
  async generateReply(input: LlmGenerateInput): Promise<LlmGenerateResult> {
    this.callCount += 1;
    this.lastInput = input;
    return { content: this.response, providerId: this.providerId };
  }
}

function buildCompanion() {
  const character = Character.create({
    personaType: "girlfriend",
    name: "Aya",
    appearanceDescription: "Perempuan muda, rambut hitam sebahu, gaya kasual",
  });
  return Companion.create({ id: randomUUID(), ownerId: randomUUID(), character });
}

function buildRuntime(opts: {
  fakeProvider: FakeLlmProvider;
  contentModerator?: ContentModerator;
  moderationFlagRepository?: InMemoryModerationFlagRepository;
  crisisDetector?: CrisisDetector;
  crisisEventRepository?: InMemoryCrisisEventRepository;
  aiDisclosureReminder?: AiDisclosureReminder;
  companionRepository: InMemoryCompanionRepository;
  conversationRepository: InMemoryConversationRepository;
  messageRepository: InMemoryMessageRepository;
}) {
  const fakeFactory: LlmProviderFactoryPort = {
    getPrimary: () => opts.fakeProvider,
    getFallbackOrPremium: () => opts.fakeProvider,
  };
  const contextAssembler = new ContextAssembler(opts.companionRepository, opts.messageRepository);
  const promptBuilder = new PromptBuilder();
  const logger = new ConsoleLogger("Test");
  const providerRuntime = new ProviderRuntime(fakeFactory, logger);

  return new ConversationRuntime(
    opts.conversationRepository,
    opts.messageRepository,
    contextAssembler,
    promptBuilder,
    providerRuntime,
    logger,
    undefined, // relationshipRuntime
    undefined, // timelineRuntime
    undefined, // memoryRuntime
    opts.contentModerator,
    opts.moderationFlagRepository,
    opts.crisisDetector,
    opts.crisisEventRepository,
    opts.aiDisclosureReminder,
  );
}

describe("Phase 4 — Safety & Trust", () => {
  describe("P4-1 Content Moderation", () => {
    it("memblokir pesan user yang menyinggung anak di bawah umur SEBELUM disimpan & TANPA memanggil provider", async () => {
      const companionRepository = new InMemoryCompanionRepository();
      const conversationRepository = new InMemoryConversationRepository();
      const messageRepository = new InMemoryMessageRepository();
      const moderationFlagRepository = new InMemoryModerationFlagRepository();
      const companion = buildCompanion();
      companionRepository.seed(companion);

      const fakeProvider = new FakeLlmProvider("tidak boleh terpanggil");
      const runtime = buildRuntime({
        fakeProvider,
        contentModerator: new ContentModerator(),
        moderationFlagRepository,
        companionRepository,
        conversationRepository,
        messageRepository,
      });

      await expect(
        runtime.handleUserMessage({
          companionId: companion.id,
          userMessage: "aku masih anak SD, boleh pacaran ga?",
        }),
      ).rejects.toBeInstanceOf(BlockedContentError);

      expect(fakeProvider.callCount).toBe(0);
      expect(messageRepository.messages).toHaveLength(0);
      expect(moderationFlagRepository.flags).toHaveLength(1);
      expect(moderationFlagRepository.flags[0].action).toBe("block");
      expect(moderationFlagRepository.flags[0].category).toBe("sexual_minor");
    });

    it("pesan flag (bukan block) tetap disimpan & percakapan tetap lanjut normal", async () => {
      const companionRepository = new InMemoryCompanionRepository();
      const conversationRepository = new InMemoryConversationRepository();
      const messageRepository = new InMemoryMessageRepository();
      const moderationFlagRepository = new InMemoryModerationFlagRepository();
      const companion = buildCompanion();
      companionRepository.seed(companion);

      const fakeProvider = new FakeLlmProvider("Oke aku dengar kamu.");
      const runtime = buildRuntime({
        fakeProvider,
        contentModerator: new ContentModerator(),
        moderationFlagRepository,
        companionRepository,
        conversationRepository,
        messageRepository,
      });

      const result = await runtime.handleUserMessage({
        companionId: companion.id,
        userMessage: "usir semua turis dari negeri ini!!",
      });

      expect(result.reply).toBe("Oke aku dengar kamu.");
      expect(fakeProvider.callCount).toBe(1);
      expect(messageRepository.messages).toHaveLength(2);
      expect(moderationFlagRepository.flags).toHaveLength(1);
      expect(moderationFlagRepository.flags[0].action).toBe("flag");
    });

    it("pesan normal tidak menghasilkan ModerationFlag sama sekali", async () => {
      const companionRepository = new InMemoryCompanionRepository();
      const conversationRepository = new InMemoryConversationRepository();
      const messageRepository = new InMemoryMessageRepository();
      const moderationFlagRepository = new InMemoryModerationFlagRepository();
      const companion = buildCompanion();
      companionRepository.seed(companion);

      const fakeProvider = new FakeLlmProvider("Halo juga!");
      const runtime = buildRuntime({
        fakeProvider,
        contentModerator: new ContentModerator(),
        moderationFlagRepository,
        companionRepository,
        conversationRepository,
        messageRepository,
      });

      await runtime.handleUserMessage({
        companionId: companion.id,
        userMessage: "Halo, apa kabar hari ini?",
      });

      expect(moderationFlagRepository.flags).toHaveLength(0);
    });
  });

  describe("P4-4 Crisis Detection", () => {
    it("mendeteksi indikasi krisis, SKIP provider LLM, kirim safe-response, catat CrisisEvent", async () => {
      const companionRepository = new InMemoryCompanionRepository();
      const conversationRepository = new InMemoryConversationRepository();
      const messageRepository = new InMemoryMessageRepository();
      const crisisEventRepository = new InMemoryCrisisEventRepository();
      const companion = buildCompanion();
      companionRepository.seed(companion);

      const fakeProvider = new FakeLlmProvider("tidak boleh terpanggil");
      const runtime = buildRuntime({
        fakeProvider,
        crisisDetector: new CrisisDetector(),
        crisisEventRepository,
        companionRepository,
        conversationRepository,
        messageRepository,
      });

      const result = await runtime.handleUserMessage({
        companionId: companion.id,
        userMessage: "aku udah capek banget hidup, pengen mati aja rasanya",
      });

      expect(result.crisisResponse).toBe(true);
      expect(result.reply).toBe(CRISIS_SAFE_RESPONSE_ID);
      expect(result.reply).toContain("119");
      expect(fakeProvider.callCount).toBe(0);
      expect(crisisEventRepository.events).toHaveLength(1);

      // Pesan user & safe-response tetap tersimpan di riwayat.
      const history = await messageRepository.findRecent({
        conversationId: result.conversationId,
        limit: 10,
      });
      expect(history).toHaveLength(2);
      expect(history[1].content).toBe(CRISIS_SAFE_RESPONSE_ID);
    });

    it("pesan normal tidak memicu crisis response & provider tetap terpanggil", async () => {
      const companionRepository = new InMemoryCompanionRepository();
      const conversationRepository = new InMemoryConversationRepository();
      const messageRepository = new InMemoryMessageRepository();
      const crisisEventRepository = new InMemoryCrisisEventRepository();
      const companion = buildCompanion();
      companionRepository.seed(companion);

      const fakeProvider = new FakeLlmProvider("Aku di sini kok!");
      const runtime = buildRuntime({
        fakeProvider,
        crisisDetector: new CrisisDetector(),
        crisisEventRepository,
        companionRepository,
        conversationRepository,
        messageRepository,
      });

      const result = await runtime.handleUserMessage({
        companionId: companion.id,
        userMessage: "hari ini capek banget kerja lembur",
      });

      expect(result.crisisResponse).toBe(false);
      expect(fakeProvider.callCount).toBe(1);
      expect(crisisEventRepository.events).toHaveLength(0);
    });
  });

  describe("P4-2 AI Disclosure Reminder", () => {
    it("muncul tepat di giliran ke-N (interval), tidak di giliran lain", async () => {
      const companionRepository = new InMemoryCompanionRepository();
      const conversationRepository = new InMemoryConversationRepository();
      const messageRepository = new InMemoryMessageRepository();
      const companion = buildCompanion();
      companionRepository.seed(companion);

      const fakeProvider = new FakeLlmProvider("balasan singkat");
      const runtime = buildRuntime({
        fakeProvider,
        aiDisclosureReminder: new AiDisclosureReminder(),
        companionRepository,
        conversationRepository,
        messageRepository,
      });

      let lastResult;
      for (let i = 0; i < 50; i++) {
        lastResult = await runtime.handleUserMessage({
          companionId: companion.id,
          userMessage: `pesan ke-${i + 1}`,
        });
      }

      // 49 giliran pertama: tidak ada reminder.
      expect(lastResult!.aiDisclosureReminder).not.toBeNull();

      const next = await runtime.handleUserMessage({
        companionId: companion.id,
        userMessage: "pesan ke-51",
      });
      expect(next.aiDisclosureReminder).toBeNull();
    });
  });

  describe("P4-3 Age Verification (User entity)", () => {
    it("menolak registrasi user di bawah 18 tahun", () => {
      const under18 = new Date();
      under18.setFullYear(under18.getFullYear() - 16);

      expect(() =>
        User.create({
          id: randomUUID(),
          email: "anak@test.com",
          passwordHash: "hashed",
          dateOfBirth: under18,
        }),
      ).toThrow(UnderageRegistrationError);
    });

    it("menerima registrasi user yang baru saja genap 18 tahun", () => {
      const exactly18 = new Date();
      exactly18.setFullYear(exactly18.getFullYear() - 18);

      expect(() =>
        User.create({
          id: randomUUID(),
          email: "dewasa@test.com",
          passwordHash: "hashed",
          dateOfBirth: exactly18,
        }),
      ).not.toThrow();
    });

    it("menolak user yang genap 18 tahun BESOK (belum genap hari ini)", () => {
      const almost18 = new Date();
      almost18.setFullYear(almost18.getFullYear() - 18);
      almost18.setDate(almost18.getDate() + 1); // ulang tahun ke-18 besok

      expect(() =>
        User.create({
          id: randomUUID(),
          email: "hampir18@test.com",
          passwordHash: "hashed",
          dateOfBirth: almost18,
        }),
      ).toThrow(UnderageRegistrationError);
    });
  });

  describe("P4-5 Data Retention (User entity)", () => {
    it("anonymize() men-scrub email/nama & idempotent (tidak menimpa timestamp asli)", () => {
      const user = User.create({
        id: randomUUID(),
        email: "user@test.com",
        passwordHash: "hashed",
        name: "Budi",
        dateOfBirth: new Date("1990-01-01"),
      });

      expect(user.isAnonymized).toBe(false);

      user.anonymize();
      const firstAnonymizedAt = user.anonymizedAt;
      expect(user.isAnonymized).toBe(true);
      expect(user.name).toBeNull();
      expect(user.email).toContain("anonymized.pao.local");

      user.anonymize(); // panggil kedua kali — tidak boleh menimpa timestamp
      expect(user.anonymizedAt).toEqual(firstAnonymizedAt);
    });
  });
});
