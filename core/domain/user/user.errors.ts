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
