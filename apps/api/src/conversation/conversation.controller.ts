import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

interface AuthenticatedRequest {
  user: { userId: string; email: string };
}

// Endpoint sengaja tidak butuh companionId di URL — karena kebijakan
// produk "1 companion per user", companion diturunkan dari user yang
// sedang login (req.user.userId), bukan parameter terpisah.
@UseGuards(JwtAuthGuard)
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post("messages")
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: AuthenticatedRequest) {
    return this.conversationService.sendMessage(req.user.userId, dto.message);
  }

  @Get("messages")
  async getHistory(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.conversationService.getHistory(req.user.userId, parsedLimit);
  }
}
