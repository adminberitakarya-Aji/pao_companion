// "block"   — konten TIDAK boleh disimpan/ditampilkan sama sekali. Percakapan
//             dihentikan dengan pesan aman, bukan balasan companion normal.
// "flag"    — konten masih diproses & ditampilkan seperti biasa, tapi
//             dicatat untuk review manusia (mis. tren kata kasar ringan).
export type ModerationAction = "block" | "flag";

export type ModerationSource = "user" | "companion";
