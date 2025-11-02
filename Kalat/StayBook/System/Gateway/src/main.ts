import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SERVICE_NAME,
  SERVICE_NOMENCLATURE,
  SERVICE_VERSION,
} from './shared/config/constants';
import { getEnvironment } from './shared/config/environment';

async function bootstrap() {
  const environment = getEnvironment(process.env);

  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: SERVICE_NOMENCLATURE,
      logLevels: environment.LOG_LEVEL,
    }),
  });
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const openapi = new DocumentBuilder()
    .setTitle(SERVICE_NAME)
    .setDescription('The StayBook api gateway description')
    .setVersion(SERVICE_VERSION)
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
        groupId: SERVICE_NOMENCLATURE,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.getOrThrow('PORT'));
}

void bootstrap();
