import { UserEmail } from "./user-email.vo";
import { InvalidUserNameError } from "./user.errors";

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
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
    public readonly createdAt: Date,
  ) {}

  static create(props: UserProps): User {
    return new User(
      props.id,
      UserEmail.create(props.email),
      props.passwordHash,
      props.name?.trim() || null,
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

  renameTo(newName: string): void {
    const trimmed = newName.trim();
    if (trimmed.length === 0) {
      throw new InvalidUserNameError("Nama tidak boleh kosong");
    }
    this._name = trimmed;
  }
}
