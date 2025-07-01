import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z, ZodObject, ZodRawShape, ZodLiteral } from 'zod';

export type HasConfigType = ZodRawShape & {
  configType: ZodLiteral<any>;
};

export interface IConfigManager {
  get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>>;
}

export class ConfigValidationError extends Error {
  constructor(message: string, public readonly errors: z.ZodError) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

@Injectable()
export class ConfigManagerService implements IConfigManager {
  private readonly logger = new Logger(ConfigManagerService.name);
  private readonly cache = new Map<string, any>();

  constructor(private configService: ConfigService) {}

  get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>> {
    const configType = this.extractConfigType(schema);
    
    // Check cache first
    if (this.cache.has(configType)) {
      return this.cache.get(configType);
    }

    try {
      // Extract environment variables matching the schema
      const rawConfig = this.extractConfigFromEnvironment(schema);
      
      // Validate with Zod schema
      const validatedConfig = schema.parse(rawConfig);
      
      // Cache the result
      this.cache.set(configType, validatedConfig);
      
      this.logger.log(`Configuration loaded and validated for type: ${configType}`);
      return validatedConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = `Configuration validation failed for type '${configType}': ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        this.logger.error(message);
        throw new ConfigValidationError(message, error);
      }
      throw error;
    }
  }

  private extractConfigType(schema: ZodObject<any>): string {
    const shape = schema.shape;
    if (shape.configType && shape.configType._def && shape.configType._def.value) {
      return shape.configType._def.value;
    }
    throw new Error('Schema must have a configType literal field');
  }

  private extractConfigFromEnvironment(schema: ZodObject<any>): Record<string, any> {
    const shape = schema.shape;
    const config: Record<string, any> = {};

    for (const [key, zodType] of Object.entries(shape)) {
      const envKey = this.convertToEnvKey(key);
      const envValue = this.configService.get(envKey);
      
      if (envValue !== undefined) {
        config[key] = this.parseValue(envValue, zodType as z.ZodType);
      }
    }

    return config;
  }

  private convertToEnvKey(key: string): string {
    // Convert camelCase to UPPER_SNAKE_CASE
    return key
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase();
  }

  private parseValue(value: string, zodType: z.ZodType): any {
    // Handle different types based on Zod type
    if (zodType instanceof z.ZodNumber) {
      const num = Number(value);
      return isNaN(num) ? value : num;
    }
    
    if (zodType instanceof z.ZodBoolean) {
      return value.toLowerCase() === 'true' || value === '1';
    }
    
    if (zodType instanceof z.ZodEnum) {
      return value;
    }
    
    if (zodType instanceof z.ZodLiteral) {
      return zodType._def.value;
    }
    
    // Default to string
    return value;
  }

  // Helper method to manually set configuration (useful for testing)
  setConfig(configType: string, config: any): void {
    this.cache.set(configType, config);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}