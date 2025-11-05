import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { KAFKA_BROKER } from './kafka.token';
import { KafkaProducer } from './kafka.producer';

@Module({
  providers: [
    {
      provide: KAFKA_BROKER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Kafka({
          brokers: config.getOrThrow('KAFKA_BROKERS'),
        }),
    },
    KafkaProducer,
  ],
  exports: [KafkaProducer],
})
export class KafkaModule {}
