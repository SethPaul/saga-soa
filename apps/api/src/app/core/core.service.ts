import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as figlet from "figlet";

export interface ICoreService {
  getSectorSplash(sectorName: string): string;
  getAliveStatus(sectorName: string): { status: string; sector: string };
  getServerInfo(): { name: string; port: number };
}

@Injectable()
export class CoreService implements ICoreService {
  constructor(private configService: ConfigService) {}

  getSectorSplash(sectorName: string): string {
    try {
      const splash = figlet.textSync(sectorName, { font: "Big" });
      return `<pre>${splash}</pre>`;
    } catch (error) {
      // Fallback if figlet fails
      return `<h1>${sectorName}</h1>`;
    }
  }

  getAliveStatus(sectorName: string): { status: string; sector: string } {
    return { status: "alive", sector: sectorName };
  }

  getServerInfo(): { name: string; port: number } {
    return {
      name: this.configService.get<string>("APP_NAME", "saga-soa"),
      port: this.configService.get<number>("PORT", 3000),
    };
  }
}
