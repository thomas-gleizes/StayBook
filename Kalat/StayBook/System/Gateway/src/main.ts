import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SERVICE_NOMENCLATURE } from './shared/config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ prefix: SERVICE_NOMENCLATURE }),
  });

  const config = app.get(ConfigService);

  app.useLogger(
    new ConsoleLogger({
      logLevels: config.getOrThrow<LogLevel[]>('LOG_LEVEL'),
      prefix: SERVICE_NOMENCLATURE,
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
    yamlDocumentUrl: '/openapi.yaml',
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: config.getOrThrow('KAFKA_BROKERS'),
      },
      consumer: {
        groupId: config.getOrThrow('KAFKA_CONSUMER_GROUP'),
      },
    },
  });

  await app.listen(config.getOrThrow('PORT'));
}

void bootstrap();
