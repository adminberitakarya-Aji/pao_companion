import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// @Global supaya PrismaService cukup di-provide SEKALI di sini (satu
// koneksi Prisma untuk seluruh aplikasi), bukan tiap module bikin instance
// sendiri-sendiri. Import module ini di AppModule, module lain (Auth,
// Companion, dst) tinggal inject PrismaService tanpa perlu provide ulang.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
