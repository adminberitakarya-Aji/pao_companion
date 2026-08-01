import { UserEmail } from "./user-email.vo";
import {
  InvalidUserNameError,
  InvalidDateOfBirthError,
  UnderageRegistrationError,
} from "./user.errors";

const MINIMUM_AGE_YEARS = 18;
const MAXIMUM_AGE_YEARS = 120; // batas atas cuma untuk menolak input absurd (mis. typo tahun), bukan aturan bisnis nyata

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  dateOfBirth: Date;
  aiDisclosureAckedAt?: Date | null;
  anonymizedAt?: Date | null;
  createdAt?: Date;
}

// Entity — punya identitas (id), constructor private supaya tidak ada
// User "invalid" yang bisa tercipta di luar factory method di bawah.
export class User {
  private constructor(
    public readonly id: string,
    private _email: UserEmail,
    private _passwordHash: string,
    private _name: string | null,
    private readonly _dateOfBirth: Date,
    private _aiDisclosureAckedAt: Date | null,
    private _anonymizedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: UserProps): User {
    assertValidAge(props.dateOfBirth);

    return new User(
      props.id,
      UserEmail.create(props.email),
      props.passwordHash,
      props.name?.trim() || null,
      props.dateOfBirth,
      props.aiDisclosureAckedAt ?? null,
      props.anonymizedAt ?? null,
      props.createdAt ?? new Date(),
    );
  }

  // Dipakai repository saat rehydrate dari database — TIDAK melalui
  // validasi ulang karena data yang datang dari DB dianggap sudah valid
  // (sudah tervalidasi saat pertama kali create()).
  static rehydrate(props: Required<UserProps>): User {
    return new User(
      props.id,
      UserEmail.create(props.email),
      props.passwordHash,
      props.name,
      props.dateOfBirth,
      props.aiDisclosureAckedAt,
      props.anonymizedAt,
      props.createdAt,
    );
  }

  get email(): string {
    return this._email.value;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get name(): string | null {
    return this._name;
  }

  get dateOfBirth(): Date {
    return this._dateOfBirth;
  }

  get aiDisclosureAckedAt(): Date | null {
    return this._aiDisclosureAckedAt;
  }

  get anonymizedAt(): Date | null {
    return this._anonymizedAt;
  }

  get isAnonymized(): boolean {
    return this._anonymizedAt !== null;
  }

  // Phase 4 (P4-5) — Data retention. Scrub PII (email, nama, password
  // hash) menjadi nilai tidak-bisa-dikembalikan, TAPI id & dateOfBirth
  // (untuk statistik agregat non-identifikasi) dipertahankan. Companion,
  // Message, Memory milik user ini dibersihkan TERPISAH oleh
  // DataRetentionRuntime lewat RetentionPurgePort — bukan tanggung jawab
  // entity User (di luar aggregate boundary-nya).
  anonymize(at: Date = new Date()): void {
    if (this.isAnonymized) return; // idempotent — jangan timpa timestamp asli
    this._email = UserEmail.create(`deleted-${this.id}@anonymized.pao.local`);
    this._name = null;
    this._passwordHash = "ANONYMIZED";
    this._anonymizedAt = at;
  }

  renameTo(newName: string): void {
    const trimmed = newName.trim();
    if (trimmed.length === 0) {
      throw new InvalidUserNameError("Nama tidak boleh kosong");
    }
    this._name = trimmed;
  }

  // Phase 4 (P4-2) — AI disclosure onboarding. Dipanggil sekali saat user
  // mengonfirmasi sudah membaca pemberitahuan "companion ini adalah AI,
  // bukan manusia sungguhan" di layar onboarding.
  acknowledgeAiDisclosure(at: Date = new Date()): void {
    this._aiDisclosureAckedAt = at;
  }

  get hasAcknowledgedAiDisclosure(): boolean {
    return this._aiDisclosureAckedAt !== null;
  }
}

function assertValidAge(dateOfBirth: Date): void {
  if (Number.isNaN(dateOfBirth.getTime())) {
    throw new InvalidDateOfBirthError("Tanggal lahir tidak valid");
  }

  const now = new Date();
  if (dateOfBirth.getTime() > now.getTime()) {
    throw new InvalidDateOfBirthError("Tanggal lahir tidak boleh di masa depan");
  }

  const age = calculateAge(dateOfBirth, now);

  if (age > MAXIMUM_AGE_YEARS) {
    throw new InvalidDateOfBirthError("Tanggal lahir tidak valid");
  }

  if (age < MINIMUM_AGE_YEARS) {
    throw new UnderageRegistrationError();
  }
}

// Umur lengkap (bukan cuma selisih tahun) — supaya user yang ulang tahun
// ke-18 BESOK tetap ditolak hari ini, bukan cuma dibulatkan ke atas.
function calculateAge(dateOfBirth: Date, at: Date): number {
  let age = at.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = at.getMonth() - dateOfBirth.getMonth();
  const dayDiff = at.getDate() - dateOfBirth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}
