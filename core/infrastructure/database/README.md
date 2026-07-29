# @pao/database

Prisma schema & migrations untuk PAO Companion.

- `prisma/schema.prisma` — schema utama (single source of truth, jangan buat schema duplikat di tempat lain)
- `seeds/seed.ts` — data awal untuk development
- Migration history akan otomatis dibuat di `prisma/migrations/` setelah `pnpm db:migrate` pertama kali dijalankan

## Perintah
```
pnpm db:generate   # generate Prisma client
pnpm db:migrate    # jalankan migration (dev)
pnpm db:studio     # buka Prisma Studio
pnpm db:seed       # jalankan seed
```
