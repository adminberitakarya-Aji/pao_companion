import { InvalidEmailError } from "./user.errors";

// Value Object — immutable, tidak punya identitas sendiri.
// Validasi format email HANYA ditulis di sini, dipakai di mana pun
// email perlu divalidasi (register, update profile, dst).
export class UserEmail {
  private constructor(public readonly value: string) {}

  static create(raw: string): UserEmail {
    const normalized = raw.trim().toLowerCase();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValid) {
      throw new InvalidEmailError(`Email tidak valid: ${raw}`);
    }
    return new UserEmail(normalized);
  }

  equals(other: UserEmail): boolean {
    return this.value === other.value;
  }
}
