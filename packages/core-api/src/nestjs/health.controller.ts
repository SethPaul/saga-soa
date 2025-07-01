import { Controller, Get, Inject, Optional } from "@nestjs/common";
import type { ILogger } from "@saga-soa/logger";

@Controller("health")
export class HealthController {
  constructor(@Optional() @Inject("ILogger") private readonly logger?: ILogger) {}

  @Get()
  check() {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "unknown",
    };

    this.logger?.info(`Health check: ${health.status}`);
    return health;
  }

  @Get("ready")
  readiness() {
    // Add any readiness checks here (database connections, etc.)
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("live")
  liveness() {
    // Basic liveness check
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
    };
  }
}