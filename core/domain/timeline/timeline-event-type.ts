// Daftar jenis milestone yang DIKENAL sistem. Sengaja union type tertutup
// (bukan string bebas) supaya konsisten dan gampang ditambah jenis baru
// di masa depan (mis. "first_gift", "anniversary") tanpa merusak data lama.
export type TimelineEventType = "first_conversation" | "relationship_level_up";
