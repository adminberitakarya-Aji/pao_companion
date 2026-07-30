// Wrapper logger sederhana — dipakai di use-case & runtime supaya tidak
// bergantung langsung ke console.log atau logger spesifik framework.
// Bisa diganti implementasinya (pino, winston, dll) tanpa ubah pemanggil.
export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly context: string) {}

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(`[${this.context}] ${message}`, meta ?? "");
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[${this.context}] ${message}`, meta ?? "");
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[${this.context}] ${message}`, meta ?? "");
  }
}
