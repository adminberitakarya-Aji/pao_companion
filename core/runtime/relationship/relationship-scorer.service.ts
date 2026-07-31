const BASE_POINTS_PER_EXCHANGE = 5;
const MAX_LENGTH_BONUS = 5;
const CHARS_PER_BONUS_POINT = 50;

// Relationship Scorer — HEURISTIK sederhana (bukan LLM call, supaya cepat
// & tanpa biaya tambahan tiap pesan). Poin dasar per pertukaran + bonus
// kecil kalau pesan user cukup panjang (proxy kasar untuk "engagement").
//
// INI BUKAN pengukuran kualitas emosional sungguhan — cuma heuristik awal
// yang gampang diganti nanti (mis. jadi berbasis sentiment analysis atau
// LLM scoring) tanpa mengubah RelationshipRuntime atau domain Relationship,
// karena scorer ini terisolasi di sini.
export class RelationshipScorer {
  scoreExchange(userMessage: string): number {
    const lengthBonus = Math.min(
      Math.floor(userMessage.length / CHARS_PER_BONUS_POINT),
      MAX_LENGTH_BONUS,
    );
    return BASE_POINTS_PER_EXCHANGE + lengthBonus;
  }
}
