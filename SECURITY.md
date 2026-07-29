# Security Policy

## Melaporkan kerentanan
Jika menemukan celah keamanan, jangan buka issue publik. Hubungi maintainer
langsung melalui kanal privat.

## Area sensitif
- Kredensial AI provider (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) — jangan pernah
  commit ke repo, selalu lewat `.env` (lihat `.gitignore`)
- Data personal & percakapan pengguna — lihat `docs/09-safety-and-trust/data-privacy.md`
- Transaksi kredit/billing — race condition pada credit deduction harus selalu
  diuji dengan concurrent request test (lihat catatan Phase 5 di ROADMAP.md)
