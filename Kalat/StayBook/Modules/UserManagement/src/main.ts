import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConsoleLogger } from '@nestjs/common';
import { SERVICE_NOMENCLATURE } from './shared/config/constants';
import { environment } from './shared/config/environment';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger: new ConsoleLogger({
      prefix: SERVICE_NOMENCLATURE,
      logLevels: environment.LOG_LEVEL,
    }),
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: environment.KAFKA_BROKERS,
      },
      consumer: {
        groupId: SERVICE_NOMENCLATURE,
      },
    },
  });

  await app.listen();
}

bootstrap();
