// Shared interfaces and types
export type { IConfigManager, HasConfigType } from "./i-config-manager";
export { ConfigValidationError } from "./config-validation-error";
export { MockConfigManager } from "./mocks/mock-config-manager";

// Legacy Inversify exports (deprecated but maintained for compatibility)
export { DotenvConfigManager } from "./dotenv-config-manager";

// Modern NestJS exports (recommended)
export { SagaConfigModule } from "./nestjs/config.module";
export { ConfigManagerService } from "./nestjs/config-manager.service";
