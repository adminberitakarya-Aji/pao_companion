# Phase 3 (patch 6/6 — TERAKHIR) — Integration Test Konsistensi

Task: **P3-6** dari `ROADMAP.md`. Ini patch TERAKHIR Phase 3 — setelah ini,
Companion Engine (Memory, Relationship, Timeline, Character diperluas)
lengkap dan tervalidasi otomatis.

## Yang diuji

Satu test besar (`tests/integration/full-conversation-consistency.test.ts`)
mensimulasikan **15 percakapan berturut-turut** dengan Memory + Relationship
+ Timeline semua tersambung (bukan versi ringan Phase 2), lalu memverifikasi
6 hal sekaligus:

1. **Milestone "percakapan pertama" cuma tercatat SEKALI** meski 15 putaran
2. **Jumlah milestone "level up" = jumlah hasil `leveledUp: true`** — tidak
   ada yang terlewat atau dobel
3. **Provider yang dipakai selalu sesuai**: `leveledUp: true` → HARUS pakai
   provider premium; kalau tidak → HARUS pakai provider default
4. **Memory bertambah persis 1 per pertukaran** (pakai fake extractor
   deterministik, supaya jumlahnya predictable untuk di-assert)
5. **KONSISTENSI KARAKTER** — ini inti dari P3-6: setiap system prompt yang
   benar-benar dikirim ke LLM (baik ke provider default maupun premium)
   HARUS selalu menyebut nama companion, jenis persona, dan info level
   kedekatan. Companion tidak boleh "amnesia" di percakapan manapun,
   termasuk saat provider berpindah dari Gemini ke Claude di momen level up.
6. **History tersimpan lengkap** — 2 pesan (user + companion) per putaran,
   tidak ada yang hilang.

Pesan simulasi sengaja dibuat panjang (>250 karakter) supaya bonus poin
`RelationshipScorer` maksimal — ini menjamin level up BENAR-BENAR terjadi
dalam 15 putaran (bukan kebetulan), sehingga jalur "premium-moment" ikut
teruji, bukan cuma jalur default.

## Cara extract & verifikasi

```bash
pnpm install
pnpm test:integration
```

Harus muncul **4 test suites... total sekitar 4 passed** (3 test lama dari
Phase 2 + 1 test besar baru ini). Kalau test baru ini gagal, baca pesan
assertion-nya — paling sering disebabkan salah satu dari:
- Ada log/console.warn tak terduga yang mengindikasikan error di salah satu
  runtime (Memory/Relationship/Timeline) selama simulasi
- Provider yang dipakai tidak sesuai `leveledUp` (kemungkinan bug di logic
  `providerReason` di `ConversationRuntime`)

## 🎉 Phase 3 — Companion Engine SELESAI

Dengan patch ini, seluruh DoD Phase 3 di `ROADMAP.md` tercapai:
- ✅ Companion mengingat fakta dari percakapan sebelumnya (Memory)
- ✅ Level hubungan berubah seiring interaksi (Relationship)
- ✅ Milestone tercatat otomatis (Timeline)
- ✅ Karakter bisa dikustomisasi penuh — gaya bicara, sifat, latar belakang (Character diperluas)
- ✅ Semuanya tersambung otomatis ke percakapan sungguhan (bukan cuma script manual)
- ✅ Konsistensi karakter tervalidasi lewat integration test otomatis

Update `PROGRESS.md`:
```
Phase 3 — Companion Engine: ✅ Selesai
```

**Jangan lupa commit & push ke GitHub** — ingat gap yang sempat ditemukan
saat audit sebelumnya (repo tertinggal beberapa patch). Sekarang saat yang
tepat untuk menyusulkan SEMUA patch Phase 2 patch 4 + kedua hotfix + seluruh
Phase 3 (patch 1-6) sekaligus, supaya GitHub benar-benar mencerminkan kerja
yang sudah selesai.

## Ke mana selanjutnya (sesuai ROADMAP.md)
- **Phase 4**: Safety & Trust — implementasi teknis penuh (content moderation,
  age verification, crisis handling, data retention) — prompt sudah ada
  pagar dasar sejak Phase 2, tapi moderation layer sungguhan belum ada
- **Phase 5**: Billing (wallet, credit, subscription, Midtrans)
- **Phase 6**: Frontend web (`apps/web`) — auth pages, chat page, companion
  dashboard, billing page
- Atau: integrasi asli fal.ai untuk avatar generation (masih stub sejak Phase 1)
