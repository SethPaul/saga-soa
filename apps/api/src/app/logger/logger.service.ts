import { Injectable, Logger } from "@nestjs/common";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ILogger {
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, error?: Error, data?: object): void;
  debug(message: string, data?: object): void;
}

@Injectable()
export class LoggerService implements ILogger {
  private readonly logger = new Logger(LoggerService.name);

  info(message: string, data?: object): void {
    if (data) {
      this.logger.log(`${message} ${JSON.stringify(data)}`);
    } else {
      this.logger.log(message);
    }
  }

  warn(message: string, data?: object): void {
    if (data) {
      this.logger.warn(`${message} ${JSON.stringify(data)}`);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, error?: Error, data?: object): void {
    const errorInfo = error ? ` ${error.message}` : "";
    const dataInfo = data ? ` ${JSON.stringify(data)}` : "";
    this.logger.error(`${message}${errorInfo}${dataInfo}`, error?.stack);
  }

  debug(message: string, data?: object): void {
    if (data) {
      this.logger.debug(`${message} ${JSON.stringify(data)}`);
    } else {
      this.logger.debug(message);
    }
  }
}
