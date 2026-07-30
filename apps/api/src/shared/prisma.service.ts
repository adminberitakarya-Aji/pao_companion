import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// Wrapper NestJS untuk PrismaClient — supaya lifecycle (connect/disconnect)
// terkelola oleh Nest, dan bisa di-inject ke mana pun butuh Prisma langsung.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
