import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    HealthModule,
    // TODO Phase 1: AuthModule
    // TODO Phase 2: ConversationModule (core/runtime/conversation orchestration)
  ],
})
export class AppModule {}
