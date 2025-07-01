import { Module } from "@nestjs/common";
import { LoggerModule } from "@saga-soa/logger";
import { CoreApiModule } from "@saga-soa/core-api";
import { HelloController } from "./controllers/hello.controller";
import { HelloAgainController } from "./controllers/hello-again.controller";

@Module({
  imports: [
    // Configure logging
    LoggerModule.forRoot({
      config: {
        configType: "PINO_LOGGER",
        level: "info",
        prettyPrint: true,
        isExpressContext: false,
      },
    }),
    
    // Core API functionality with health checks
    CoreApiModule.forRoot({
      enableHealth: true,
    }),
  ],
  controllers: [
    HelloController,
    HelloAgainController,
  ],
})
export class AppModule {}