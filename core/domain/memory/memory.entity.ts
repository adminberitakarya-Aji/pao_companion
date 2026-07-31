import { EmptyMemoryContentError } from "./memory.errors";

export interface MemoryProps {
  id: string;
  companionId: string;
  content: string;
  createdAt?: Date;
}

// Memory — satu fakta personal tentang USER yang layak diingat companion
// jangka panjang (mis. "User bekerja sebagai guru SD di Semarang").
// SENGAJA "flat" (cuma teks bebas, bukan struktur key-value kaku) supaya
// fleksibel menyimpan berbagai jenis fakta tanpa skema rigid — trade-off:
// pencarian/filtering by category tidak semudah struktur terpisah, tapi
// untuk volume yang wajar (puluhan-ratusan memory per companion) ini cukup.
export class Memory {
  private constructor(
    public readonly id: string,
    public readonly companionId: string,
    public readonly content: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: MemoryProps): Memory {
    const trimmed = props.content.trim();
    if (trimmed.length === 0) {
      throw new EmptyMemoryContentError();
    }
    return new Memory(
      props.id,
      props.companionId,
      trimmed,
      props.createdAt ?? new Date(),
    );
  }
}
