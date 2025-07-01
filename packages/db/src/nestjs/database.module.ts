import { Module, Global, DynamicModule } from "@nestjs/common";
import { MongoService } from "./mongo.service";
import type { MongoProviderConfig } from "../mongo-provider-config";

export interface DatabaseModuleOptions {
  config?: MongoProviderConfig;
  configs?: MongoProviderConfig[];
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions = {}): DynamicModule {
    const { config, configs } = options;
    
    // Support both single config and multiple configs
    const mongoConfigs = configs || (config ? [config] : []);
    
    const providers = [
      {
        provide: "MONGO_CONFIGS",
        useValue: mongoConfigs,
      },
      MongoService,
      {
        provide: "IMongoProvider",
        useExisting: MongoService,
      },
    ];

    // Create individual providers for each named connection
    mongoConfigs.forEach((mongoConfig) => {
      providers.push({
        provide: `MONGO_${mongoConfig.instanceName}`,
        useFactory: (mongoService: MongoService) => mongoService.getConnection(mongoConfig.instanceName),
        inject: [MongoService],
      });
    });

    return {
      module: DatabaseModule,
      providers,
      exports: [MongoService, "IMongoProvider", ...mongoConfigs.map(c => `MONGO_${c.instanceName}`)],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: options.imports || [],
      providers: [
        {
          provide: "DATABASE_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: "MONGO_CONFIGS",
          useFactory: (dbOptions: DatabaseModuleOptions) => {
            const { config, configs } = dbOptions;
            return configs || (config ? [config] : []);
          },
          inject: ["DATABASE_OPTIONS"],
        },
        MongoService,
        {
          provide: "IMongoProvider",
          useExisting: MongoService,
        },
      ],
      exports: [MongoService, "IMongoProvider"],
    };
  }

  // Helper method for single connection
  static forMongo(config: MongoProviderConfig): DynamicModule {
    return DatabaseModule.forRoot({ config });
  }
}