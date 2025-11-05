import { Inject, Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KAFKA_BROKER } from './kafka.token';

@Injectable()
export class KafkaProducer {
  private readonly logger = new Logger('KAFKA PRODUCER');
  private readonly producer: Producer;

  constructor(
    @Inject(KAFKA_BROKER)
    broker: Kafka,
  ) {
    this.producer = broker.producer({ idempotent: true });
  }

  async publish(topic: string, message: any, key: string) {
    this.logger.debug(topic);

    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(message) }],
    });
  }
}
