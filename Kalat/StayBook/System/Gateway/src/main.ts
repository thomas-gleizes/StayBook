import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { environment } from './core/config/environment';
import { KafkaDeserializer } from './core/kafka/kafka-deserializer';
import {
  SERVICE_NAME,
  SERVICE_FQN,
  SERVICE_VERSION,
} from './core/config/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: SERVICE_FQN,
      logLevels: environment.LOG_LEVEL,
    }),
  });
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
      client: { brokers: environment.KAFKA_BROKERS },
      consumer: { groupId: SERVICE_FQN },
      deserializer: new KafkaDeserializer(),
    },
  });

  await app.listen(environment.PORT);
  await app.startAllMicroservices();
}

void bootstrap();
