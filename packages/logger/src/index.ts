// Shared interfaces and types
export type { ILogger, LogLevel } from "./i-logger";
export { PinoLoggerSchema } from "./pino-logger-schema";
export type { PinoLoggerConfig } from "./pino-logger-schema";
export { MockLogger } from "./mocks/mock-logger";

// Legacy Inversify exports (deprecated but maintained for compatibility)
export { PinoLogger } from "./pino-logger";

// Modern NestJS exports (recommended)
export { LoggerModule } from "./nestjs/logger.module";
export { LoggerService } from "./nestjs/logger.service";
