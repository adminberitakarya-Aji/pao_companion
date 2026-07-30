// Interface hashing password — implementasi asli (bcrypt) ada di
// core/infrastructure, supaya domain/application tidak bergantung ke library.
export interface PasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
