import { Controller, Get, Inject, Param } from "@nestjs/common";
import { BaseController } from "@saga-soa/core-api";
import type { ILogger } from "@saga-soa/logger";

@Controller("hello-again")
export class HelloAgainController extends BaseController {
  readonly sectorName = "hello-again";

  constructor(@Inject("ILogger") logger: ILogger) {
    super(logger);
  }

  @Get("/test-route")
  testRoute() {
    this.logger.info("Hello again route hit");
    return "Hello Again!";
  }

  @Get("/greeting/:name")
  personalGreeting(@Param("name") name: string) {
    this.logger.info(`Personal greeting requested for: ${name}`);
    return {
      message: `Hello again, ${name}!`,
      sector: this.sectorName,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("/status")
  status() {
    return {
      status: "operational",
      sector: this.sectorName,
      features: ["personal-greetings", "logging", "modern-nestjs"],
      timestamp: new Date().toISOString(),
    };
  }
}