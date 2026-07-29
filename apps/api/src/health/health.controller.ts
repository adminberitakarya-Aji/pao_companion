import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      service: "pao-companion-api",
      timestamp: new Date().toISOString(),
    };
  }
}
