import { Controller, Get, Param } from "@nestjs/common";
import { CoreService } from "./core.service";

@Controller("saga-soa")
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get()
  getHome(): string {
    return this.coreService.getSectorSplash("SAGA-SOA");
  }

  @Get("alive")
  getAlive() {
    return this.coreService.getAliveStatus("SAGA-SOA");
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      ...this.coreService.getServerInfo(),
    };
  }

  @Get(":sector")
  getSectorHome(@Param("sector") sector: string): string {
    return this.coreService.getSectorSplash(sector);
  }

  @Get(":sector/alive")
  getSectorAlive(@Param("sector") sector: string) {
    return this.coreService.getAliveStatus(sector);
  }
}
