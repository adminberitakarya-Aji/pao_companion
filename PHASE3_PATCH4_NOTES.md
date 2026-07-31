# Phase 3 (patch 4/6) — Character Diperluas — Catatan Penerapan

Task: **P3-4** dari `ROADMAP.md`. Extract setelah patch 1-3 (Memory,
Relationship, Timeline) jalan. Patch ini agak besar karena menyentuh
semua layer (domain → application → infrastructure → API → runtime),
karena "Character diperluas" perlu tersambung penuh sampai ke prompt.

## Yang dibangun di patch ini

1. **3 field baru di `Character`**, semua OPSIONAL (companion lama tetap
   valid tanpa migrasi data):
   - **`speechStyle`**: `"formal" | "casual" | "playful" | "shy" | "confident"`
   - **`traits`**: daftar sifat singkat (maks 8, tiap traits maks 30 karakter) — mis. `["humoris", "perhatian"]`
   - **`backstory`**: latar belakang/cerita karakter (maks 1000 karakter)
2. **Value Object baru**: `CharacterTraits`, `CharacterBackstory` — validasi
   terpisah, pola sama seperti `CharacterAppearance` dari Phase 1
   (termasuk `TODO` moderation check untuk Phase 4).
3. **Prisma schema** — tambah kolom `speechStyle`, `traits` (array),
   `backstory` ke tabel `companions`.
4. **`POST /companions`** sekarang menerima field baru ini (opsional).
5. **`PromptBuilder` diupdate** — field baru benar-benar masuk ke system
   prompt (gaya bicara, sifat-sifat, latar belakang), bukan cuma tersimpan
   di database tanpa efek.
6. **Script `pnpm test:character-extended`** — TIDAK butuh database/API
   key, langsung bandingkan system prompt sebelum vs sesudah pakai field baru.

## Cara extract & setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate      # nama migration: extend_character_fields
```

## Cara verifikasi

**1. Cek logic prompt (paling cepat, tidak perlu apa pun selain install):**
```bash
pnpm test:character-extended
```
Bandingkan 2 system prompt yang muncul — versi kedua (dengan `speechStyle`,
`traits`, `backstory`) harus terlihat jelas lebih detail & personal.

**2. Cek `POST /companions` menerima field baru** (perlu USER BARU karena
"Aya" sudah ada — 1 companion per user):
```powershell
# Register user baru untuk tes ini
$reg = Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method Post -ContentType "application/json" -Body '"'"'{"email":"test-extended@pao.test","password":"password123"}'"'"'
$headers = @{ Authorization = "Bearer $($reg.accessToken)" }

Invoke-RestMethod -Uri http://localhost:3001/companions -Method Post -Headers $headers -ContentType "application/json" -Body '"'"'{
  "personaType": "boyfriend",
  "name": "Rian",
  "appearanceDescription": "Laki-laki, tinggi, rambut pendek",
  "speechStyle": "confident",
  "traits": ["protektif", "humoris", "romantis"],
  "backstory": "Rian besar di Bandung, suka olahraga, dan selalu ada buat orang yang disayanginya."
}'"'"'
```
Response harus menampilkan `speechStyle`, `traits`, `backstory` sesuai
yang dikirim.

**3. (Opsional) Coba chat dengan companion baru ini** — lewat
`/conversations/messages` — perhatikan apakah gaya balasannya terasa
beda dari "Aya" (yang belum punya field ini), sesuai `speechStyle` yang
di-set (`confident` untuk Rian).

Tempel hasil verifikasi 1 & 2 minimal — sebelum kita lanjut ke **patch 5
(paling penting): sambungkan Memory+Relationship+Timeline ke
ConversationRuntime**, supaya semuanya jalan otomatis tiap chat.

## Yang BELUM ada (menyusul)
- Patch 5: Memory/Relationship/Timeline disambungkan ke `ConversationRuntime`
- Patch 6: Integration test konsistensi (simulasi banyak percakapan, cek
  karakter tidak "amnesia")
