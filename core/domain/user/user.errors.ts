import { DomainError } from "../../shared/errors";

export class InvalidEmailError extends DomainError {
  readonly code = "USER_INVALID_EMAIL";
  readonly httpStatus = 400;
}

export class InvalidUserNameError extends DomainError {
  readonly code = "USER_INVALID_NAME";
  readonly httpStatus = 400;
}

export class EmailAlreadyRegisteredError extends DomainError {
  readonly code = "USER_EMAIL_ALREADY_REGISTERED";
  readonly httpStatus = 409;

  constructor(email: string) {
    super(`Email sudah terdaftar: ${email}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = "USER_INVALID_CREDENTIALS";
  readonly httpStatus = 401;

  constructor() {
    super("Email atau password salah");
  }
}

// Phase 4 (P4-3) — Verifikasi usia. Produk ini punya persona
// GIRLFRIEND/BOYFRIEND (companion romantis), jadi batas usia registrasi
// adalah 18 tahun, bukan cuma "anak-anak ditolak". Dicek di User.create()
// supaya TIDAK ADA jalur lain (use-case lupa validasi, dsb.) yang bisa
// membuat User di bawah umur tercipta.
export class UnderageRegistrationError extends DomainError {
  readonly code = "USER_UNDERAGE_REGISTRATION";
  readonly httpStatus = 403;

  constructor() {
    super("Pendaftaran ditolak: layanan ini hanya untuk pengguna berusia 18 tahun ke atas");
  }
}

export class InvalidDateOfBirthError extends DomainError {
  readonly code = "USER_INVALID_DATE_OF_BIRTH";
  readonly httpStatus = 400;

  constructor(message: string) {
    super(message);
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = "USER_NOT_FOUND";
  readonly httpStatus = 404;

  constructor(userId: string) {
    super(`User tidak ditemukan: ${userId}`);
  }
}
