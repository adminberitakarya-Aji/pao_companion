# Contributing

## Alur kerja
1. Ambil satu task ID dari `ROADMAP.md` (mis. `P1-3`)
2. Branch: `feature/P1-3-domain-companion`
3. Commit: `P1-3: implement Companion domain entity`
4. Satu PR = satu ID task (atau grup kecil terkait) — jangan gabung banyak Phase
5. CI harus hijau sebelum merge
6. Update checklist di `PROGRESS.md` setelah task selesai

## Aturan arsitektur
- `apps/*` tidak boleh berisi business logic — hanya entrypoint yang memanggil `core/`
- `core/domain/` tidak boleh bergantung pada framework (NestJS, Prisma, dll)
- Adapter provider AI (LLM/voice/image/video) HANYA di `core/infrastructure/providers/`
- Orkestrasi pemanggilan provider HANYA di `core/runtime/provider/`
- Jangan mulai Phase berikutnya sebelum Definition of Done Phase sebelumnya
  di `ROADMAP.md` tercapai 100%
