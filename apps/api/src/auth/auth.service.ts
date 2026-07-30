import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { NestTokenIssuer } from "./nest-token-issuer.service";
import { PrismaUserRepository } from "../../../../core/infrastructure/database/repositories/prisma-user.repository";
import { BcryptPasswordHasher } from "../../../../core/infrastructure/security/bcrypt-password-hasher";
import { RegisterUserUseCase } from "../../../../core/application/use-cases/auth/register-user.usecase";
import { LoginUserUseCase } from "../../../../core/application/use-cases/auth/login-user.usecase";
import { ConsoleLogger } from "../../../../core/shared/logger/logger";
import { RegisterUserInput, LoginUserInput, AuthResult } from "../../../../core/application/dto/auth.dto";

// Service ini HANYA wiring — merakit dependency lalu delegasikan ke use-case.
// Tidak ada business logic di sini, semua business logic ada di core/application & core/domain.
@Injectable()
export class AuthService {
  private readonly registerUseCase: RegisterUserUseCase;
  private readonly loginUseCase: LoginUserUseCase;

  constructor(
    prisma: PrismaService,
    tokenIssuer: NestTokenIssuer,
  ) {
    const userRepository = new PrismaUserRepository(prisma);
    const passwordHasher = new BcryptPasswordHasher();
    const logger = new ConsoleLogger("Auth");

    this.registerUseCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      tokenIssuer,
      logger,
    );
    this.loginUseCase = new LoginUserUseCase(
      userRepository,
      passwordHasher,
      tokenIssuer,
      logger,
    );
  }

  async register(input: RegisterUserInput): Promise<AuthResult> {
    return this.registerUseCase.execute(input);
  }

  async login(input: LoginUserInput): Promise<AuthResult> {
    return this.loginUseCase.execute(input);
  }
}
