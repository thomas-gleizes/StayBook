import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KAFKA_BROKER } from './kafka.token';
import { RawBaseMessage } from '../messaging/messaging.interface';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  private readonly logger = new Logger('Producer');
  private readonly producer: Producer;

  constructor(
    @Inject(KAFKA_BROKER)
    broker: Kafka,
  ) {
    this.producer = broker.producer({ idempotent: true });
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async publish<M extends RawBaseMessage>(topic: string, messages: M[], key: string) {
    this.logger.debug(topic);

    await this.producer.send({
      topic,
      messages: messages.map((message) => ({ key: key, value: JSON.stringify(message) })),
    });
  }
}
