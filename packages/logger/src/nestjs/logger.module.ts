import { Module, Global, DynamicModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerService } from "./logger.service";
import { PinoLoggerConfig, PinoLoggerSchema } from "../pino-logger-schema";

export interface LoggerModuleOptions {
  config?: Partial<PinoLoggerConfig>;
  useEnvConfig?: boolean;
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: LoggerModuleOptions = {}): DynamicModule {
    const providers = [
      {
        provide: "LOGGER_CONFIG",
        useFactory: (configService?: ConfigService) => {
          const baseConfig: PinoLoggerConfig = {
            configType: "PINO_LOGGER",
            level: "info",
            prettyPrint: true,
            isExpressContext: false,
            logFile: undefined,
          };

          // If using environment config, try to get from ConfigService
          if (options.useEnvConfig && configService) {
            const envConfig = {
              level: configService.get("LOG_LEVEL", "info"),
              prettyPrint: configService.get("LOG_PRETTY_PRINT", "true") === "true",
              isExpressContext: configService.get("LOG_EXPRESS_CONTEXT", "false") === "true",
              logFile: configService.get("LOG_FILE"),
            };

            const mergedConfig = { ...baseConfig, ...envConfig, ...options.config };
            return PinoLoggerSchema.parse(mergedConfig);
          }

          // Use provided config or defaults
          const mergedConfig = { ...baseConfig, ...options.config };
          return PinoLoggerSchema.parse(mergedConfig);
        },
        inject: options.useEnvConfig ? [ConfigService] : [],
      },
      LoggerService,
      {
        provide: "ILogger",
        useExisting: LoggerService,
      },
    ];

    const imports = options.useEnvConfig ? [ConfigModule] : [];

    return {
      module: LoggerModule,
      imports,
      providers,
      exports: [LoggerService, "ILogger"],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<PinoLoggerConfig> | PinoLoggerConfig;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    return {
      module: LoggerModule,
      imports: options.imports || [],
      providers: [
        {
          provide: "LOGGER_CONFIG",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        LoggerService,
        {
          provide: "ILogger",
          useExisting: LoggerService,
        },
      ],
      exports: [LoggerService, "ILogger"],
    };
  }
}