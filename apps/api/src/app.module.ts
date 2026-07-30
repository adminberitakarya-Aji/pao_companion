import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./shared/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CompanionModule } from "./companion/companion.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CompanionModule,
    // TODO Phase 2: ConversationModule (core/runtime/conversation orchestration)
  ],
})
export class AppModule {}
