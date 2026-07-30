import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenIssuer } from "../../../../core/application/services/token-issuer.service";

// Implementasi TokenIssuer yang ASLI pakai @nestjs/jwt.
// core/application hanya kenal interface TokenIssuer, tidak kenal NestJS.
@Injectable()
export class NestTokenIssuer implements TokenIssuer {
  constructor(private readonly jwtService: JwtService) {}

  async issueAccessToken(payload: { userId: string; email: string }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
