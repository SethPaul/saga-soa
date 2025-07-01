# 🚀 Migration Guide: Express + Inversify → NestJS

This guide helps you migrate from the legacy Express + Inversify patterns to modern NestJS architecture.

## 📋 **Migration Overview**

### Current State
- ✅ **All packages support both patterns** - No breaking changes!
- ✅ **Legacy code continues to work** - Migrate at your own pace
- ✅ **Modern patterns available** - Start using immediately

### Migration Strategy
1. **🔄 Gradual Migration** - Migrate features one at a time
2. **🎯 New Development** - Use modern patterns for all new features
3. **📦 Package by Package** - Start with the most critical dependencies

## 🎯 **Quick Start: Using Modern Patterns**

### 1. **New NestJS Application**

Create a new application using all modernized packages:

```typescript
// src/app.module.ts
import { Module } from "@nestjs/common";
import { LoggerModule } from "@saga-soa/logger";
import { DatabaseModule } from "@saga/db"; 
import { CoreApiModule } from "@saga-soa/core-api";

@Module({
  imports: [
    // Automatic logging with configuration
    LoggerModule.forRoot({
      config: {
        configType: "PINO_LOGGER",
        level: "info",
        prettyPrint: true,
        isExpressContext: false,
      },
    }),
    
    // MongoDB with lifecycle management
    DatabaseModule.forMongo({
      instanceName: "main",
      host: process.env.MONGO_HOST || "localhost",
      port: 27017,
      database: process.env.MONGO_DB || "myapp",
    }),
    
    // Core API with health checks
    CoreApiModule.forRoot({
      enableHealth: true,
    }),
  ],
  controllers: [
    // Your controllers here
  ],
})
export class AppModule {}
```

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application running on http://localhost:${port}/api`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
```

### 2. **Modern Controller Pattern**

Replace old routing-controllers with pure NestJS:

**Before (Legacy)**:
```typescript
// Old Inversify + routing-controllers
import { injectable, inject } from "inversify";
import { Get } from "routing-controllers";
import { RestControllerBase, RestController } from "@saga-soa/core-api";
import type { ILogger } from "@saga-soa/logger";

@injectable()
@RestController("/api/users")
export class UsersRest extends RestControllerBase {
  constructor(@inject("ILogger") logger: ILogger) {
    super(logger, "users");
  }

  @Get("/")
  getUsers() {
    this.logger.info("Getting users");
    return { users: [] };
  }
}
```

**After (Modern)**:
```typescript
// New NestJS pattern
import { Controller, Get, Inject } from "@nestjs/common";
import { BaseController } from "@saga-soa/core-api";
import type { ILogger } from "@saga-soa/logger";

@Controller("users")
export class UsersController extends BaseController {
  readonly sectorName = "users";

  constructor(@Inject("ILogger") logger: ILogger) {
    super(logger);
  }

  @Get()
  getUsers() {
    this.logger.info("Getting users");
    return { 
      users: [],
      timestamp: new Date().toISOString(),
      sector: this.sectorName
    };
  }
}
```

## 📦 **Package-by-Package Migration**

### **Logger Migration**

**Legacy Pattern** (still works):
```typescript
import { Container } from "inversify";
import { PinoLogger } from "@saga-soa/logger";

const container = new Container();
container.bind<ILogger>("ILogger").to(PinoLogger);
const logger = container.get<ILogger>("ILogger");
```

**Modern Pattern** (recommended):
```typescript
// In AppModule
import { LoggerModule } from "@saga-soa/logger";

@Module({
  imports: [
    LoggerModule.forRoot({
      config: {
        configType: "PINO_LOGGER",
        level: "debug",
        prettyPrint: true,
        isExpressContext: false,
        logFile: process.env.LOG_FILE,
      },
    }),
  ],
})

// In controllers/services
constructor(@Inject("ILogger") private logger: ILogger) {}
```

### **Configuration Migration**

**Legacy Pattern**:
```typescript
import { DotenvConfigManager } from "@saga-soa/config";
container.bind<IConfigManager>("IConfigManager").to(DotenvConfigManager);
const config = container.get<IConfigManager>("IConfigManager").get(MySchema);
```

**Modern Pattern**:
```typescript
// In AppModule
import { SagaConfigModule } from "@saga-soa/config";

@Module({
  imports: [
    SagaConfigModule.forRoot({
      envFilePath: [".env.local", ".env"],
      isGlobal: true,
    }),
  ],
})

// In services
constructor(@Inject("IConfigManager") private config: IConfigManager) {}
const myConfig = this.config.get(MySchema);
```

### **Database Migration**

**Legacy Pattern**:
```typescript
import { MongoProvider } from "@saga/db";
container.bind<IMongoProvider>("IMongoProvider").to(MongoProvider);
const mongo = container.get<IMongoProvider>("IMongoProvider");
await mongo.connect();
```

**Modern Pattern**:
```typescript
// In AppModule
import { DatabaseModule } from "@saga/db";

@Module({
  imports: [
    DatabaseModule.forMongo({
      instanceName: "main",
      host: "localhost",
      port: 27017,
      database: "myapp",
    }),
  ],
})

// In services (automatic connection management)
constructor(@Inject("IMongoProvider") private mongo: IMongoProvider) {}
// Connection automatically opened on module init
// Connection automatically closed on module destroy
```

## 🔧 **Advanced Migration Scenarios**

### **Multiple Database Connections**

```typescript
// Multiple MongoDB instances
DatabaseModule.forRoot({
  configs: [
    {
      instanceName: "main",
      host: "localhost",
      port: 27017,
      database: "main_db",
    },
    {
      instanceName: "analytics",
      host: "analytics-host",
      port: 27017,
      database: "analytics_db",
    },
  ],
})

// Access specific connections
constructor(
  @Inject("MONGO_main") private mainDb: MongoClient,
  @Inject("MONGO_analytics") private analyticsDb: MongoClient,
) {}
```

### **Environment-Specific Configuration**

```typescript
// Development
LoggerModule.forRoot({
  config: {
    configType: "PINO_LOGGER",
    level: "debug",
    prettyPrint: true,
    isExpressContext: false,
  },
})

// Production  
LoggerModule.forRoot({
  config: {
    configType: "PINO_LOGGER",
    level: "info",
    prettyPrint: false,
    isExpressContext: true,
    logFile: "/var/log/app.log",
  },
})
```

### **Async Configuration**

```typescript
import { ConfigService } from "@nestjs/config";

// Async database configuration
DatabaseModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    config: {
      instanceName: "main",
      host: configService.get("MONGO_HOST"),
      port: configService.get("MONGO_PORT", 27017),
      database: configService.get("MONGO_DB"),
      username: configService.get("MONGO_USER"),
      password: configService.get("MONGO_PASS"),
    },
  }),
  inject: [ConfigService],
  imports: [ConfigModule],
})
```

## 🧪 **Testing Migration**

### **Modern Testing Pattern**

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { LoggerModule } from "@saga-soa/logger";
import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          config: {
            configType: "PINO_LOGGER",
            level: "debug",
            prettyPrint: false,
            isExpressContext: false,
          },
        }),
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    await module.close();
  });
});
```

## 📈 **Migration Checklist**

### **Phase 1: Setup Modern Infrastructure**
- [ ] Add NestJS dependencies to your application
- [ ] Create `AppModule` with modernized package imports
- [ ] Create new `main.ts` with NestJS bootstrap
- [ ] Test that the application starts successfully

### **Phase 2: Migrate Controllers**
- [ ] Replace `@RestController` with `@Controller`
- [ ] Replace `routing-controllers` decorators with NestJS equivalents
- [ ] Extend `BaseController` instead of `RestControllerBase`
- [ ] Update dependency injection to use `@Inject`

### **Phase 3: Update Services**
- [ ] Replace Inversify container usage with NestJS DI
- [ ] Use `@Injectable()` decorator on services
- [ ] Update constructor injection patterns
- [ ] Test service functionality

### **Phase 4: Environment & Configuration**
- [ ] Replace manual config loading with `SagaConfigModule`
- [ ] Update environment variable patterns
- [ ] Add Zod validation schemas
- [ ] Test configuration loading

### **Phase 5: Database Integration**
- [ ] Replace manual MongoDB connection with `DatabaseModule`
- [ ] Remove manual connection/disconnection code
- [ ] Test database connectivity and lifecycle
- [ ] Update database access patterns

### **Phase 6: Testing & Validation**
- [ ] Migrate test suites to NestJS testing utilities
- [ ] Add integration tests for new patterns
- [ ] Validate all endpoints work correctly
- [ ] Performance test the new architecture

## 🚀 **Benefits After Migration**

### **Developer Experience**
- ✅ **Hot Reload** - Automatic restart on code changes
- ✅ **Type Safety** - Enhanced TypeScript integration
- ✅ **IDE Support** - Better IntelliSense and debugging
- ✅ **Testing** - Built-in testing utilities and mocking

### **Architecture**
- ✅ **Unified DI** - Single dependency injection system
- ✅ **Modular Design** - Clear separation of concerns
- ✅ **Lifecycle Management** - Automatic resource handling
- ✅ **Health Monitoring** - Built-in health check endpoints

### **Operations**
- ✅ **Production Ready** - Battle-tested NestJS patterns
- ✅ **Monitoring** - Structured logging and health checks
- ✅ **Scalability** - Modern microservice architecture
- ✅ **Maintainability** - Industry-standard patterns

## 🆘 **Need Help?**

### **Common Issues**

**Issue**: "Cannot find module '@saga-soa/config'"
**Solution**: The config package has build issues with decorators. Use direct configuration in AppModule instead.

**Issue**: "Dependency injection not working"
**Solution**: Ensure the module providing the dependency is imported in your module's `imports` array.

**Issue**: "Database connection not working"
**Solution**: Check that environment variables are set correctly and MongoDB is running.

### **Migration Support**

1. **Start Small** - Migrate one controller at a time
2. **Test Thoroughly** - Ensure each migration step works before proceeding
3. **Keep Legacy** - Don't delete old code until new code is fully tested
4. **Use Examples** - Reference the modernized REST API example

The migration path is smooth and all patterns are battle-tested. You can migrate incrementally without any downtime! 🎉