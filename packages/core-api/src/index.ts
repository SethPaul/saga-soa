// Shared types and schemas
export { ExpressServerSchema } from "./express-server-schema";
export type { ExpressServerConfig } from "./express-server-schema";

// Legacy Inversify exports (deprecated but maintained for compatibility)
export { ExpressServer } from "./express-server";
export { RestControllerBase, RestController, REST_API_BASE_PATH } from "./rest-controller";

// Modern NestJS exports (recommended)
export { CoreApiModule } from "./nestjs/core-api.module";
export { BaseController } from "./nestjs/base.controller";
export { HealthController } from "./nestjs/health.controller";