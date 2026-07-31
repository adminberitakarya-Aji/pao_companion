import { RelationshipLevel, calculateLevel } from "./relationship-level";

export interface RelationshipProps {
  id: string;
  companionId: string;
  affectionPoints?: number;
  createdAt?: Date;
}

// Relationship — 1 per Companion (bukan per User, tapi karena 1 companion
// = 1 user, hasilnya sama saja). Nilai poin AKUMULATIF, tidak pernah
// berkurang (relationship tidak "mundur" di Phase 3 — kemungkinan fitur
// masa depan kalau produk butuh, belum ada di scope sekarang).
export class Relationship {
  private constructor(
    public readonly id: string,
    public readonly companionId: string,
    private _affectionPoints: number,
    public readonly createdAt: Date,
  ) {}

  static create(props: RelationshipProps): Relationship {
    return new Relationship(
      props.id,
      props.companionId,
      props.affectionPoints ?? 0,
      props.createdAt ?? new Date(),
    );
  }

  get affectionPoints(): number {
    return this._affectionPoints;
  }

  get level(): RelationshipLevel {
    return calculateLevel(this._affectionPoints);
  }

  // Menambah poin dari satu interaksi. Return TRUE kalau level BARU SAJA
  // naik — ini sinyal yang dikonsumsi Timeline Runtime (Phase 3 patch 3)
  // untuk mencatat milestone otomatis, dan nanti Provider Runtime (Phase 3
  // patch 5) untuk memicu "premium-moment" (pakai Claude, bukan Gemini).
  addPoints(amount: number): boolean {
    const levelBefore = this.level;
    this._affectionPoints += amount;
    return this.level > levelBefore;
  }
}
