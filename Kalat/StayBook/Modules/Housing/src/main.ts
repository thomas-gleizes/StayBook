import { NestFactory } from '@nestjs/core';
import { HousingModule } from './housing.module';
import { ConsoleLogger } from '@nestjs/common';
import { environment } from './core/config/environment';
import { SERVICE_FQN } from './core/config/constants';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KafkaDeserializer } from './core/kafka/kafka-deserializer';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(HousingModule, {
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
      deserializer: new KafkaDeserializer(environment.SCHEMA_REGISTER_URL),
    },
  });

  await app.listen();
}

bootstrap();
