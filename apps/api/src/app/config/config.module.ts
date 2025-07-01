import { Module, Global } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { ConfigManagerService } from "./config-manager.service";

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      expandVariables: true,
    }),
  ],
  providers: [
    {
      provide: "IConfigManager",
      useClass: ConfigManagerService,
    },
    ConfigManagerService,
  ],
  exports: ["IConfigManager", ConfigManagerService],
})
export class EnhancedConfigModule {}
