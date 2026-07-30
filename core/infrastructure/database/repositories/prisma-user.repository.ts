import { PrismaClient } from "@prisma/client";
import { User } from "../../../domain/user/user.entity";
import { UserRepository } from "../../../domain/user/user.repository";

// Implementasi ASLI dari UserRepository — satu-satunya tempat yang boleh
// import PrismaClient untuk urusan User. Use-case tidak pernah import ini
// langsung, hanya lewat interface UserRepository.
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return User.rehydrate({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      name: record.name,
      createdAt: record.createdAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return User.rehydrate({
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      name: record.name,
      createdAt: record.createdAt,
    });
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
      },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
      },
    });
  }
}
