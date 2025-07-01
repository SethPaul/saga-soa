import { Injectable, Inject, Optional } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { z, ZodObject } from "zod";
import type { IConfigManager, HasConfigType } from "../i-config-manager";
import { ConfigValidationError } from "../config-validation-error";

@Injectable()
export class ConfigManagerService implements IConfigManager {
  constructor(
    private readonly configService: ConfigService,
    @Optional() @Inject("CONFIG_SCHEMA") private readonly defaultSchema?: ZodObject<any>
  ) {}

  /**
   * Loads and validates configuration from environment variables using the provided Zod object schema.
   * @param schema Zod object schema describing the config shape (must include a configType literal field)
   * @returns Strongly typed config object
   * @throws ConfigValidationError if validation fails
   */
  get<T extends HasConfigType>(schema: ZodObject<T>): z.infer<ZodObject<T>> {
    const schemaToUse = schema;

    // Extract configType from schema (assumes a literal field named configType)
    const configType = (schemaToUse.shape as any).configType.value as string;
    const prefix = configType.toUpperCase() + "_";
    const input: Record<string, any> = {};

    // Build configuration object from environment variables
    for (const key in schemaToUse.shape) {
      if (key === "configType") continue;
      
      const envVar = prefix + key.toUpperCase();
      const value = this.configService.get(envVar);
      
      if (value !== undefined) {
        // Try to parse boolean values
        if (value === "true") {
          input[key] = true;
        } else if (value === "false") {
          input[key] = false;
        } else if (!isNaN(Number(value)) && value !== "") {
          // Try to parse numeric values
          input[key] = Number(value);
        } else {
          input[key] = value;
        }
      }
    }
    
    input.configType = configType;

    try {
      return schemaToUse.parse(input) as z.infer<ZodObject<T>>;
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new ConfigValidationError(configType, err);
      }
      throw err;
    }
  }

  /**
   * Get a raw environment variable value
   */
  getRaw(key: string): string | undefined {
    return this.configService.get(key);
  }

  /**
   * Get an environment variable with a default value
   */
  getOrDefault<T = string>(key: string, defaultValue: T): T {
    return this.configService.get(key, defaultValue);
  }
}