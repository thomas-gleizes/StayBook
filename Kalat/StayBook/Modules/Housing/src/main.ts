import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { environment } from './core/config/environment';
import { SERVICE_FQN } from './core/config/constants';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MessagingService } from './infrastructure/messaging/messaging.service';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    logger: new ConsoleLogger({
      logLevels: environment.LOG_LEVEL,
      prefix: SERVICE_FQN,
    }),
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: environment.KAFKA_BROKERS,
        clientId: SERVICE_FQN,
      },
      consumer: {
        groupId: SERVICE_FQN,
      },
    },
  });

  await app.listen();

  const messaging = app.get(MessagingService);

  const result = await messaging.findUser('4367085a-23ba-41a4-9629-37b1d2e3f8f7');

  console.log('Result', result);
}

bootstrap();
