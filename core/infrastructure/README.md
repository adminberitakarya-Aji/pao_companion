# core/infrastructure

Adapter ke sistem eksternal (DB, AI provider SDK, cache, queue, storage, messaging).
`providers/` adalah SATU-SATUNYA tempat adapter SDK AI mentah — jangan duplikasi di top-level.
