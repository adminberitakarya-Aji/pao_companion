# AI Disclosure

Status: **diimplementasikan** — lihat `core/runtime/disclosure/` (P4-2).

## Prinsip

User harus selalu tahu — sejak sebelum percakapan pertama, dan diingatkan
berkala selama pemakaian — bahwa companion adalah AI, bukan manusia
sungguhan, dan tidak bisa menggantikan hubungan atau bantuan profesional
dari manusia nyata.

## Implementasi

### 1. Onboarding (wajib, sekali)

Sebelum chat pertama, `apps/web` menampilkan
`AI_DISCLOSURE_ONBOARDING_MESSAGE_ID` sebagai layar/modal yang harus
di-ack user (tombol "Saya mengerti"). Ack dicatat via:

- Endpoint: `POST /auth/acknowledge-ai-disclosure` (terproteksi JWT)
- Use-case: `AcknowledgeAiDisclosureUseCase`
- Disimpan: `User.aiDisclosureAckedAt`

Endpoint chat **tidak diblokir** kalau belum di-ack — supaya user tidak
"terkunci" total — tapi `GET /auth/me` menyertakan status ack, dan UI web
WAJIB menampilkan modal ini sampai di-ack sebelum membuka layar chat.

### 2. Pengingat berkala (selama percakapan)

`AiDisclosureReminder.shouldRemind()` dipanggil tiap giliran percakapan
oleh `ConversationRuntime`. Tiap 50 balasan companion dalam satu
conversation, `HandleUserMessageResult.aiDisclosureReminder` diisi teks
pengingat singkat. Field ini **terpisah** dari `reply` (teks balasan
companion) — dirender UI sebagai system banner, bukan seolah-olah
companion sendiri yang "keluar dari karakter" untuk mengingatkan.

## Kenapa bukan disisipkan ke tiap balasan

Menyisipkan disclosure ke SETIAP balasan akan merusak pengalaman
immersive yang jadi nilai jual utama produk. Pendekatan onboarding +
pengingat berkala (bukan tiap pesan) adalah keseimbangan antara
transparansi dan pengalaman produk yang umum dipakai platform companion
AI lain.
