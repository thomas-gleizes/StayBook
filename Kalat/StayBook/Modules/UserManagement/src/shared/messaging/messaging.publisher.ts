import { Global, Injectable, Logger } from '@nestjs/common';
import { KafkaProducer } from '../kafka/kafka.producer';
import { DomainEvent } from './messaging.interface';

@Injectable()
export class MessagingPublisher {
  private readonly logger = new Logger(MessagingPublisher.name);

  constructor(private readonly producer: KafkaProducer) {}

  async publishEvent(events: DomainEvent[]) {
    const [event] = events;
    this.logger.debug(
      `Publishing ${events.length} event(s) to topic "${event.aggregate_type}" for aggregate ID "${event.aggregate_id}"`,
    );

    await this.producer.publish(event.aggregate_type, events, event.aggregate_id);
  }
}
