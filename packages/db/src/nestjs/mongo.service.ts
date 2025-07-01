import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { MongoClient } from "mongodb";
import type { IMongoProvider } from "../i-mongo-connection-manager";
import type { MongoProviderConfig } from "../mongo-provider-config";

@Injectable()
export class MongoService implements IMongoProvider, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private connections = new Map<string, { client: MongoClient; config: MongoProviderConfig }>();
  
  // For backward compatibility with IMongoProvider interface
  public instanceName = "default";

  constructor(@Inject("MONGO_CONFIGS") private readonly configs: MongoProviderConfig[]) {}

  async onModuleInit() {
    // Connect to all configured databases on module initialization
    for (const config of this.configs) {
      try {
        await this.createConnection(config);
        this.logger.log(`Connected to MongoDB instance '${config.instanceName}'`);
      } catch (error) {
        this.logger.error(`Failed to connect to MongoDB instance '${config.instanceName}':`, error);
        // Don't throw here - allow graceful degradation
      }
    }
  }

  async onModuleDestroy() {
    // Disconnect from all databases on module destruction
    const disconnectPromises = Array.from(this.connections.values()).map(({ client, config }) =>
      client.close().catch((error) => {
        this.logger.error(`Error disconnecting from '${config.instanceName}':`, error);
      })
    );
    
    await Promise.all(disconnectPromises);
    this.connections.clear();
    this.logger.log("All MongoDB connections closed");
  }

  async connect(): Promise<void> {
    // For backward compatibility - connect to the first/default connection
    if (this.configs.length > 0) {
      const config = this.configs[0];
      if (config) {
        await this.createConnection(config);
      }
    }
  }

  async disconnect(): Promise<void> {
    // For backward compatibility - disconnect the first/default connection
    if (this.configs.length > 0) {
      const config = this.configs[0];
      if (config) {
        const instanceName = config.instanceName;
        const connection = this.connections.get(instanceName);
        if (connection) {
          await connection.client.close();
          this.connections.delete(instanceName);
        }
      }
    }
  }

  isConnected(): boolean {
    // For backward compatibility - check if any connection is active
    return this.connections.size > 0;
  }

  getClient(): MongoClient {
    // For backward compatibility - return the first/default client
    if (this.configs.length > 0) {
      const config = this.configs[0];
      if (config) {
        const connection = this.connections.get(config.instanceName);
        if (connection) {
          return connection.client;
        }
      }
    }
    throw new Error("No MongoDB client is connected");
  }

  // Extended NestJS methods for multi-connection support
  getConnection(instanceName: string): MongoClient {
    const connection = this.connections.get(instanceName);
    if (!connection) {
      throw new Error(`MongoDB connection '${instanceName}' not found`);
    }
    return connection.client;
  }

  isConnectionActive(instanceName: string): boolean {
    const connection = this.connections.get(instanceName);
    return !!connection && !!(connection.client as any).topology?.isConnected();
  }

  async createConnection(config: MongoProviderConfig): Promise<void> {
    const uri = this.buildConnectionString(config);
    const client = new MongoClient(uri, config.options);
    
    try {
      await client.connect();
      this.connections.set(config.instanceName, { client, config });
    } catch (error) {
      this.logger.error(`Failed to connect to MongoDB '${config.instanceName}':`, error);
      throw error;
    }
  }

  private buildConnectionString(config: MongoProviderConfig): string {
    const { host, port, database, username, password } = config;
    let auth = "";
    if (username && password) {
      auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }
    return `mongodb://${auth}${host}:${port}/${database}`;
  }
}