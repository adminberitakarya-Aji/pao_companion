import { DomainError } from "../../shared/errors";

export class ContextAssemblyError extends DomainError {
  readonly code = "CONTEXT_ASSEMBLY_FAILED";
  readonly httpStatus = 500;
}
