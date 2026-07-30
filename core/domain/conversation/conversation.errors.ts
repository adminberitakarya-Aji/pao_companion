import { DomainError } from "../../shared/errors";

export class ConversationNotFoundError extends DomainError {
  readonly code = "CONVERSATION_NOT_FOUND";
  readonly httpStatus = 404;
}

export class EmptyMessageError extends DomainError {
  readonly code = "MESSAGE_EMPTY";
  readonly httpStatus = 400;

  constructor() {
    super("Isi pesan tidak boleh kosong");
  }
}

export class MessageTooLongError extends DomainError {
  readonly code = "MESSAGE_TOO_LONG";
  readonly httpStatus = 400;
}
