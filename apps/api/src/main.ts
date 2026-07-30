import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DomainErrorFilter } from "./shared/domain-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global — terjemahkan semua DomainError (dari core/domain & core/application)
  // jadi HTTP response dengan status code yang benar.
  app.useGlobalFilters(new DomainErrorFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`[api] listening on http://localhost:${port}`);
}

bootstrap();
