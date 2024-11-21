import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import { AppModule } from './app.module';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Response compression
  app.use(compression());

  const config = new DocumentBuilder()
    .setTitle('FXQL Parser API')
    .setDescription(
      'API documentation for the Foreign Exchange Query Language Parser',
    )
    .setVersion('1.0')
    .addTag('FXQL')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // csurf prevention
  if (process.env.NODE_ENV === 'production') {
    app.use(csurf());
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
