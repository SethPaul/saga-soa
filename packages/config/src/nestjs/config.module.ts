import { Module, Global, DynamicModule } from "@nestjs/common";
import { ConfigModule as NestConfigModule, ConfigService } from "@nestjs/config";
import { ConfigManagerService } from "./config-manager.service";
import { ZodObject } from "zod";
import type { HasConfigType } from "../i-config-manager";

export interface ConfigModuleOptions<T extends HasConfigType> {
  schema?: ZodObject<T>;
  envFilePath?: string | string[];
  ignoreEnvFile?: boolean;
  isGlobal?: boolean;
}

@Global()
@Module({})
export class SagaConfigModule {
  static forRoot<T extends HasConfigType>(
    options: ConfigModuleOptions<T> = {}
  ): DynamicModule {
    const {
      schema,
      envFilePath = [".env.local", ".env"],
      ignoreEnvFile = false,
      isGlobal = true,
    } = options;

    const providers = [
      {
        provide: "CONFIG_SCHEMA",
        useValue: schema || null,
      },
      ConfigManagerService,
      {
        provide: "IConfigManager",
        useExisting: ConfigManagerService,
      },
    ];

    return {
      module: SagaConfigModule,
      imports: [
        NestConfigModule.forRoot({
          envFilePath,
          ignoreEnvFile,
          isGlobal,
        }),
      ],
      providers,
      exports: [ConfigManagerService, "IConfigManager", NestConfigModule],
      global: isGlobal,
    };
  }

  static forRootAsync<T extends HasConfigType>(options: {
    useFactory: (...args: any[]) => Promise<ConfigModuleOptions<T>> | ConfigModuleOptions<T>;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    return {
      module: SagaConfigModule,
      imports: [
        NestConfigModule.forRoot({
          isGlobal: true,
        }),
        ...(options.imports || []),
      ],
      providers: [
        {
          provide: "CONFIG_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: "CONFIG_SCHEMA",
          useFactory: (configOptions: ConfigModuleOptions<T>) => configOptions.schema || null,
          inject: ["CONFIG_OPTIONS"],
        },
        ConfigManagerService,
        {
          provide: "IConfigManager",
          useExisting: ConfigManagerService,
        },
      ],
      exports: [ConfigManagerService, "IConfigManager", NestConfigModule],
      global: true,
    };
  }

  // Helper method for creating configuration with specific schemas
  static withSchema<T extends HasConfigType>(schema: ZodObject<T>): DynamicModule {
    return SagaConfigModule.forRoot({ schema, isGlobal: true });
  }
}