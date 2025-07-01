import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoClient } from "mongodb";

export interface IMongoProvider {
  readonly instanceName: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getClient(): MongoClient;
}

export interface MongoDbConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  instanceName: string;
  options?: any;
}

@Injectable()
export class MongoDbService
  implements IMongoProvider, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MongoDbService.name);
  public readonly instanceName: string;
  private client: MongoClient | null = null;
  private config: MongoDbConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>("MONGO_HOST", "localhost"),
      port: this.configService.get<number>("MONGO_PORT", 27017),
      database: this.configService.get<string>("MONGO_DATABASE", "saga-soa"),
      username: this.configService.get<string>("MONGO_USERNAME"),
      password: this.configService.get<string>("MONGO_PASSWORD"),
      instanceName: this.configService.get<string>(
        "MONGO_INSTANCE_NAME",
        "default",
      ),
      options: {
        maxPoolSize: this.configService.get<number>("MONGO_MAX_POOL_SIZE", 10),
        serverSelectionTimeoutMS: this.configService.get<number>(
          "MONGO_SERVER_SELECTION_TIMEOUT",
          5000,
        ),
      },
    };
    this.instanceName = this.config.instanceName;
  }

  async onModuleInit() {
    // Make database connection optional for development
    try {
      await this.connect();
    } catch (error) {
      this.logger.warn(
        `MongoDB connection failed - running without database: ${error.message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.isConnected()) {
      this.logger.log(
        `MongoDB connection '${this.instanceName}' already active`,
      );
      return;
    }

    try {
      const uri = this.buildConnectionString();
      this.client = new MongoClient(uri, this.config.options);
      await this.client.connect();
      this.logger.log(
        `MongoDB connection '${this.instanceName}' established successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect to MongoDB '${this.instanceName}'`,
        error,
      );
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.logger.log(`MongoDB connection '${this.instanceName}' closed`);
      } catch (error) {
        this.logger.error(
          `Error closing MongoDB connection '${this.instanceName}'`,
          error,
        );
      }
    }
  }

  isConnected(): boolean {
    return !!this.client && !(this.client as any).closed;
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error(
        `MongoClient '${this.instanceName}' is not connected. Database operations are not available.`,
      );
    }
    return this.client;
  }

  getDatabase(name?: string) {
    if (!this.client) {
      throw new Error(
        `Database '${this.instanceName}' is not connected. Database operations are not available.`,
      );
    }
    const dbName = name || this.config.database;
    return this.getClient().db(dbName);
  }

  private buildConnectionString(): string {
    const { host, port, database, username, password } = this.config;
    let auth = "";
    if (username && password) {
      auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }
    return `mongodb://${auth}${host}:${port}/${database}`;
  }
}
