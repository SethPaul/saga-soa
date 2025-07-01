import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS if needed
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();