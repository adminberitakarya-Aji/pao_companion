import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Global validation — otomatis reject request yang tidak sesuai DTO
  // (class-validator decorators di RegisterDto, LoginDto, dst).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // buang field yang tidak terdaftar di DTO
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[api] listening on http://localhost:${port}`);
}

bootstrap();
