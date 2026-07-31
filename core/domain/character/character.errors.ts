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

export class InvalidSpeechStyleError extends DomainError {
  readonly code = "CHARACTER_INVALID_SPEECH_STYLE";
  readonly httpStatus = 400;

  constructor(value: string) {
    super(`Gaya bicara tidak valid: ${value}`);
  }
}

export class InvalidTraitsError extends DomainError {
  readonly code = "CHARACTER_INVALID_TRAITS";
  readonly httpStatus = 400;
}

export class InvalidBackstoryError extends DomainError {
  readonly code = "CHARACTER_INVALID_BACKSTORY";
  readonly httpStatus = 400;
}
