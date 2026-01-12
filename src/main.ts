import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📱 Webhook endpoint: http://localhost:${port}/webhook/whatsapp`);
}
bootstrap().catch((err) => {
  console.error('❌ Application failed to start:', err);
});
