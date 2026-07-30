import { DomainError } from "../../shared/errors";

export class CompanionAlreadyExistsError extends DomainError {
  readonly code = "COMPANION_ALREADY_EXISTS";
  readonly httpStatus = 409;

  constructor() {
    super("User sudah memiliki companion — 1 user hanya bisa punya 1 companion");
  }
}

export class CompanionNotFoundError extends DomainError {
  readonly code = "COMPANION_NOT_FOUND";
  readonly httpStatus = 404;
}
