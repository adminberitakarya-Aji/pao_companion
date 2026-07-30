// Interface — implementasi asli (pakai @nestjs/jwt) ada di apps/api,
// supaya use-case di application layer tidak bergantung ke NestJS.
export interface TokenIssuer {
  issueAccessToken(payload: { userId: string; email: string }): Promise<string>;
}

export const TOKEN_ISSUER = Symbol("TOKEN_ISSUER");
