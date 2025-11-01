import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { getEnvironment } from './shared/config/environment';

async function bootstrap() {
  const environment = getEnvironment(process.env);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger: new ConsoleLogger({
      compact: 1,
      prefix: 'User',
      logLevels: environment.LOG_LEVEL.split(',') as LogLevel[],
    }),
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: environment.KAFKA_BROKERS.split(','),
      },
      consumer: {
        groupId: environment.KAFKA_CONSUMER,
      },
    },
  });

  await app.listen();
}

bootstrap();
