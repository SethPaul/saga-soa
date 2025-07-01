import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { EnhancedConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    EnhancedConfigModule,
    LoggerModule,
    DatabaseModule,
    CoreModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}