import { DomainError } from "../../shared/errors";

export class InvalidPersonaTypeError extends DomainError {
  readonly code = "CHARACTER_INVALID_PERSONA_TYPE";
  readonly httpStatus = 400;

  constructor(value: string) {
    super(`Tipe companion tidak valid: ${value}. Harus "girlfriend" atau "boyfriend"`);
  }
}

export class InvalidCharacterNameError extends DomainError {
  readonly code = "CHARACTER_INVALID_NAME";
  readonly httpStatus = 400;
}

export class InvalidAppearanceError extends DomainError {
  readonly code = "CHARACTER_INVALID_APPEARANCE";
  readonly httpStatus = 400;
}
