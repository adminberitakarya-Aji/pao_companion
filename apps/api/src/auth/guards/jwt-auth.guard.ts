import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Pasang @UseGuards(JwtAuthGuard) di controller/endpoint yang butuh proteksi.
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
