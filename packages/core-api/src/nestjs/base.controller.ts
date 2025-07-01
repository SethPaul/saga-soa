import { Controller, Get, Inject, Optional } from "@nestjs/common";
import type { ILogger } from "@saga-soa/logger";
import figlet from "figlet";

@Controller()
export abstract class BaseController {
  protected readonly logger: ILogger;
  
  abstract readonly sectorName: string;

  constructor(@Optional() @Inject("ILogger") logger?: ILogger) {
    // Provide a fallback logger if none is injected
    this.logger = logger || {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] ${msg}`),
      error: (msg: string, err?: Error) => console.error(`[ERROR] ${msg}`, err),
      debug: (msg: string) => console.debug(`[DEBUG] ${msg}`),
    };
  }

  @Get("/")
  home() {
    const splash = figlet.textSync(this.sectorName, { font: "Alligator" });
    return `<pre>${splash}</pre>`;
  }

  @Get("/alive")
  alive() {
    return { 
      status: "alive", 
      sector: this.sectorName,
      timestamp: new Date().toISOString()
    };
  }
}