import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix("saga-soa");
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Example REST server running at http://localhost:${port}/saga-soa/hello`);
  console.log(`📋 Health check available at http://localhost:${port}/saga-soa/health`);
}

bootstrap();