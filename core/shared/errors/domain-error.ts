// Base class untuk semua error domain — memudahkan apps/api membedakan
// "error bisnis yang wajar" (400/409/dst) vs "error tak terduga" (500).
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
