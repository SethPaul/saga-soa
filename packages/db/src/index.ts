// Shared interfaces and types
export { MongoProviderSchema } from "./mongo-provider-config";
export type { MongoProviderConfig } from "./mongo-provider-config";
export type { IMongoProvider } from "./i-mongo-connection-manager";

// Legacy Inversify exports (deprecated but maintained for compatibility)
export { MongoProvider } from "./mongo-provider";

// Modern NestJS exports (recommended)
export { DatabaseModule } from "./nestjs/database.module";
export { MongoService } from "./nestjs/mongo.service";
