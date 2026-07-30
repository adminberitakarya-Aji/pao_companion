import { User } from "./user.entity";

// Interface saja — implementasi asli (Prisma) ada di core/infrastructure.
// Use-case di core/application HANYA bergantung ke interface ini.
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
