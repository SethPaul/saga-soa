import { Module, DynamicModule } from "@nestjs/common";
import { BaseController } from "./base.controller";
import { HealthController } from "./health.controller";

export interface CoreApiModuleOptions {
  controllers?: any[];
  globalPrefix?: string;
  enableHealth?: boolean;
}

@Module({})
export class CoreApiModule {
  static forRoot(options: CoreApiModuleOptions = {}): DynamicModule {
    const { 
      controllers = [], 
      enableHealth = true 
    } = options;

    const defaultControllers = [];
    
    if (enableHealth) {
      defaultControllers.push(HealthController);
    }

    return {
      module: CoreApiModule,
      controllers: [...defaultControllers, ...controllers],
      exports: [],
    };
  }

  static forFeature(controllers: any[]): DynamicModule {
    return {
      module: CoreApiModule,
      controllers,
      exports: [],
    };
  }
}