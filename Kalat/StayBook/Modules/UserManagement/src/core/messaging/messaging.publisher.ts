import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer } from '../kafka/kafka.producer';

@Injectable()
export class MessagingPublisher {
  private readonly logger = new Logger(MessagingPublisher.name);

  constructor(private readonly producer: KafkaProducer) {}

  async publish(topic: string, correlationId: string, message: Buffer) {
    await this.producer.publish(topic, correlationId, [message]);
  }
}
