import { DomainError } from "../../shared/errors";

export class EmptyMemoryContentError extends DomainError {
  readonly code = "MEMORY_EMPTY_CONTENT";
  readonly httpStatus = 400;

  constructor() {
    super("Isi memory tidak boleh kosong");
  }
}
