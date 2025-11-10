import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { KAFKA_BROKER } from './kafka.token';
import { KafkaProducer } from './kafka.producer';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaRunner } from './kafka.runner';

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
    KafkaConsumer,
    KafkaRunner,
  ],
  exports: [KafkaProducer, KafkaConsumer, KafkaRunner],
})
export class KafkaModule {}
