// 5 tingkat kedekatan — dari "baru kenal" sampai "sangat dekat".
// Threshold poin SENGAJA disimpan di sini (bukan di entity langsung)
// supaya gampang di-tuning tanpa menyentuh logic entity.
export type RelationshipLevel = 1 | 2 | 3 | 4 | 5;

const LEVEL_THRESHOLDS: { level: RelationshipLevel; minPoints: number }[] = [
  { level: 5, minPoints: 1500 },
  { level: 4, minPoints: 700 },
  { level: 3, minPoints: 300 },
  { level: 2, minPoints: 100 },
  { level: 1, minPoints: 0 },
];

export function calculateLevel(affectionPoints: number): RelationshipLevel {
  const match = LEVEL_THRESHOLDS.find((t) => affectionPoints >= t.minPoints);
  return match ? match.level : 1;
}

export const LEVEL_LABELS: Record<RelationshipLevel, string> = {
  1: "Baru kenal",
  2: "Mulai akrab",
  3: "Dekat",
  4: "Sangat dekat",
  5: "Sangat erat",
};
