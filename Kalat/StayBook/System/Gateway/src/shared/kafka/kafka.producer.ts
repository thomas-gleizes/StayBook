import { BaseMessage } from './kafka-message.interface';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KAFKA_BROKER } from './kafka.token';
import { Kafka, Producer } from 'kafkajs';

export class KafkaProducer implements OnModuleInit {
  private readonly logger = new Logger(KafkaProducer.name);
  private readonly producer: Producer;

  constructor(
    @Inject(KAFKA_BROKER)
    broker: Kafka,
  ) {
    this.producer = broker.producer({ allowAutoTopicCreation: true });
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Producer connected');
  }

  async produce<M extends BaseMessage>(topic: string, message: M, key: string) {
    this.logger.debug(`Producing message - ${topic}`);

    await this.producer.send({
      topic: topic,
      messages: [{ key: key, value: JSON.stringify(message) }],
    });
  }
}
