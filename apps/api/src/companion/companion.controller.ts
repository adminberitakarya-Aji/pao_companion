import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { CompanionService } from "./companion.service";
import { CreateCompanionDto } from "./dto/create-companion.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

interface AuthenticatedRequest {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)   // SEMUA endpoint companion wajib login
@Controller("companions")
export class CompanionController {
  constructor(private readonly companionService: CompanionService) {}

  @Post()
  async create(@Body() dto: CreateCompanionDto, @Req() req: AuthenticatedRequest) {
    return this.companionService.create({
      ownerId: req.user.userId,
      personaType: dto.personaType,
      name: dto.name,
      appearanceDescription: dto.appearanceDescription,
      personalityDescription: dto.personalityDescription,
    });
  }

  @Get("me")
  async getMine(@Req() req: AuthenticatedRequest) {
    return this.companionService.getMine(req.user.userId);
  }
}
