import { Controller, Get, Inject } from "@nestjs/common";
import { BaseController } from "@saga-soa/core-api";
import type { ILogger } from "@saga-soa/logger";

@Controller("hello")
export class HelloController extends BaseController {
  readonly sectorName = "hello";

  constructor(@Inject("ILogger") logger: ILogger) {
    super(logger);
  }

  @Get("/test-route")
  testRoute() {
    this.logger.info("Hello route hit");
    return "Hello";
  }

  @Get("/welcome")
  welcome() {
    this.logger.info("Welcome route accessed");
    return {
      message: "Welcome to the modernized Hello sector!",
      sector: this.sectorName,
      timestamp: new Date().toISOString(),
    };
  }
}