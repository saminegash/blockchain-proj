import { RateLimitingGuard } from './common/rate-limiting.guard';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new RateLimitingGuard());

  const config = new DocumentBuilder()
    .setTitle('Blockchain Price Tracker')
    .setDescription('API for tracking Ethereum and Polygon prices')
    .setVersion('1.0')
    .addTag('prices')
    .addTag('alerts')
    .addTag('health')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
