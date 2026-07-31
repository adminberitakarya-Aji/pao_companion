import { DomainError } from "../../shared/errors";

export class RelationshipNotFoundError extends DomainError {
  readonly code = "RELATIONSHIP_NOT_FOUND";
  readonly httpStatus = 404;
}
