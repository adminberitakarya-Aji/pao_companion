import { DomainError } from "../../shared/errors";

export class EmptyTimelineDescriptionError extends DomainError {
  readonly code = "TIMELINE_EMPTY_DESCRIPTION";
  readonly httpStatus = 400;

  constructor() {
    super("Deskripsi milestone tidak boleh kosong");
  }
}
