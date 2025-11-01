import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useLogger(
    new ConsoleLogger({
      compact: 1,
      prefix: 'User',
      logLevels: config.get('LOG_LEVEL', 'log').split(',') as LogLevel[],
    }),
  );

  const openapi = new DocumentBuilder()
    .setTitle('StayBook API')
    .setDescription('The StayBook api gateway description')
    .setVersion('alpha')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, openapi);
  SwaggerModule.setup('swagger', app, documentFactory, {
    raw: true,
    jsonDocumentUrl: '/openapi.json',
  });

  app.connectMicroservice({});

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
