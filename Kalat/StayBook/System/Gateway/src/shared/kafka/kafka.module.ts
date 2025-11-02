import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAFKA_BROKER } from './kafka.token';
import { KafkaProducer } from './kafka.producer';
import { SERVICE_NOMENCLATURE } from '../config/constants';
import { Kafka } from 'kafkajs';

@Global()
@Module({
  providers: [
    {
      provide: KAFKA_BROKER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Kafka({
          clientId: SERVICE_NOMENCLATURE,
          brokers: config.getOrThrow('KAFKA_BROKERS'),
        }),
    },
    KafkaProducer,
  ],
  exports: [KafkaProducer],
})
export class KafkaModule {}
