# Phase 2 (patch 4/4 — TERAKHIR) — Endpoint HTTP + Integration Test

Task: **P2-7, P2-8** dari `ROADMAP.md`. Ini patch TERAKHIR Phase 2 —
setelah ini, seluruh vertical slice percakapan lengkap dari domain sampai
HTTP endpoint yang bisa dipanggil `apps/web`/`apps/mobile`.

## Yang dibangun di patch ini

1. **`POST /conversations/messages`** — kirim pesan, dapat balasan companion.
   Body: `{ "message": "..." }`. Auth wajib (JWT). `companionId` TIDAK perlu
   dikirim — diturunkan dari user yang login (sesuai kebijakan 1 companion
   per user).
2. **`GET /conversations/messages?limit=50`** — ambil history percakapan.
   Berguna untuk Phase 6 (chat UI di `apps/web`).
3. **Integration test** (`tests/integration/conversation-runtime.test.ts`,
   3 test case) — pakai in-memory repository + fake LLM provider, **TIDAK
   butuh database atau API key sungguhan**, jadi bisa jalan di CI:
   - Alur normal end-to-end (simpan pesan → context → prompt → provider → balasan)
   - Fallback ke provider kedua saat primary gagal
   - Percakapan kedua pada companion yang sama pakai `Conversation` yang
     sudah ada (bukan bikin baru tiap kali)
4. **Perbaikan kecil**: tipe `ProviderRuntime` diubah supaya testable
   (`LlmProviderFactoryPort` — cuma "Pick" 2 method yang dibutuhkan,
   bukan import class `LlmProviderFactory` asli sebagai tipe parameter).

## Cara extract & setup

```bash
pnpm install
```

Tidak ada perubahan schema — tidak perlu migration baru.

## Cara verifikasi

**1. Integration test (tidak butuh apa pun selain `pnpm install`):**
```bash
pnpm test:integration
```
Harus muncul `3 passed` (3 test case di atas semuanya hijau).

**2. Endpoint HTTP (butuh `pnpm dev` jalan + user & companion sudah ada):**
```powershell
$token = (Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method Post -ContentType "application/json" -Body '{"email":"aji@pao.test","password":"password123"}').accessToken
$headers = @{ Authorization = "Bearer $token" }

# Kirim pesan
Invoke-RestMethod -Uri http://localhost:3001/conversations/messages -Method Post -Headers $headers -ContentType "application/json" -Body '{"message":"Halo, apa kabar?"}'

# Ambil history
Invoke-RestMethod -Uri http://localhost:3001/conversations/messages -Headers $headers
```

(sesuaikan port 3001 dengan `PORT` di `.env` Anda)

Kalau kedua langkah verifikasi berhasil, checklist di `PROGRESS.md` untuk
seluruh Phase 2 (`P2-1` s/d `P2-8`) bisa diubah jadi selesai:

```
Phase 2 — Vertical Slice Percakapan: ✅ Selesai
```

## 🎉 Ini pencapaian penting

Vertical slice yang jadi validasi utama roadmap sudah lengkap: dari user
login, buat companion custom (nama, appearance, persona GF/BF), sampai
chat dengan balasan AI yang konsisten dengan karakter, tersimpan di
database, dengan fallback provider otomatis. Ini fondasi yang akan
diperluas terus di Phase 3 (Memory, Relationship, Timeline) TANPA perlu
merombak apa yang sudah ada — cuma menambah runtime baru yang disambungkan
lewat `ContextAssembler`.

## Yang BELUM ada (Phase 3 dan seterusnya)
- Memory Runtime, Relationship Runtime, Timeline Runtime (Phase 3)
- Integrasi asli fal.ai untuk avatar (masih stub `NoopAvatarGenerationQueue` dari Phase 1)
- Safety & Trust implementasi teknis penuh (Phase 4) — prompt sudah ada
  pagar dasar, tapi moderation layer sungguhan belum
- Billing (Phase 5), Frontend web (Phase 6), dst sesuai `ROADMAP.md`
