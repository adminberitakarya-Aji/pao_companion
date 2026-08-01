import { randomUUID } from "crypto";
import { User } from "../../../domain/user/user.entity";
import { UserRepository } from "../../../domain/user/user.repository";
import { EmailAlreadyRegisteredError } from "../../../domain/user/user.errors";
import { PasswordHasher } from "../../../shared/utils/password-hasher";
import { TokenIssuer } from "../../services/token-issuer.service";
import { Logger } from "../../../shared/logger/logger";
import { RegisterUserInput, AuthResult } from "../../dto/auth.dto";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
    private readonly logger: Logger,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase(),
    );
    if (existing) {
      throw new EmailAlreadyRegisteredError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      name: input.name,
      // new Date("invalid string") -> Invalid Date, ditangkap & dilempar
      // sebagai InvalidDateOfBirthError di dalam User.create() (bukan di
      // sini) — satu tempat validasi, konsisten dengan aturan lain.
      dateOfBirth: new Date(input.dateOfBirth),
    });

    await this.userRepository.save(user);
    this.logger.info("User registered", { userId: user.id });

    const accessToken = await this.tokenIssuer.issueAccessToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
    };
  }
}
