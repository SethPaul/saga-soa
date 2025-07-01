import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongoDbService } from "./mongodb.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: "IMongoProvider",
      useClass: MongoDbService,
    },
    MongoDbService,
  ],
  exports: ["IMongoProvider", MongoDbService],
})
export class DatabaseModule {}
