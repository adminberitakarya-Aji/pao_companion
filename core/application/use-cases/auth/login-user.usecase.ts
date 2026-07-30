import { UserRepository } from "../../../domain/user/user.repository";
import { InvalidCredentialsError } from "../../../domain/user/user.errors";
import { PasswordHasher } from "../../../shared/utils/password-hasher";
import { TokenIssuer } from "../../services/token-issuer.service";
import { Logger } from "../../../shared/logger/logger";
import { LoginUserInput, AuthResult } from "../../dto/auth.dto";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
    private readonly logger: Logger,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(
      input.email.trim().toLowerCase(),
    );
    if (!user) {
      // Sengaja pakai error yang sama dengan "password salah" —
      // jangan bocorkan apakah email terdaftar atau tidak.
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    this.logger.info("User logged in", { userId: user.id });

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
