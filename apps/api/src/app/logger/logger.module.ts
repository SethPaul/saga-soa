import { Module, Global } from "@nestjs/common";
import { LoggerService } from "./logger.service";

@Global()
@Module({
  providers: [
    {
      provide: "ILogger",
      useClass: LoggerService,
    },
    LoggerService,
  ],
  exports: ["ILogger", LoggerService],
})
export class LoggerModule {}
