import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Contoh endpoint terproteksi — dipakai untuk verifikasi Phase 1 DoD:
  // "akses endpoint terproteksi return 401 tanpa token, 200 dengan token valid"
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Req() req: { user: { userId: string; email: string } }) {
    return { userId: req.user.userId, email: req.user.email };
  }

  // Phase 4 (P4-2) — dipanggil web/mobile saat user menekan "Saya
  // mengerti" di layar onboarding AI disclosure.
  @UseGuards(JwtAuthGuard)
  @Post("acknowledge-ai-disclosure")
  async acknowledgeAiDisclosure(@Req() req: { user: { userId: string; email: string } }) {
    return this.authService.acknowledgeAiDisclosure(req.user.userId);
  }
}
