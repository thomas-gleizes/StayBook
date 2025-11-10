import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer } from '../kafka/kafka.producer';
import { ActionMessage, DomainEvent, ErrorMessage, ReplyMessage } from './messaging.interface';
import { SERVICE_FQN } from '../config/constants';
import { randomUUID } from 'crypto';

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

  async publishReply<Payload = unknown>(payload: Payload, origin: ActionMessage) {
    const message: ReplyMessage<Payload> = {
      id: randomUUID(),
      content_type: origin.reply_to,
      metadata: {},
      created_by: SERVICE_FQN,
      created_at: new Date().toISOString(),
      payload: payload,
      correlation_id: origin.correlation_id,
    };

    await this.producer.publish<ReplyMessage<Payload>>(origin.reply_to, [message], origin.correlation_id);
  }

  async publishError(error: Error, origin: ActionMessage) {
    const topic = `${SERVICE_FQN}.error`;

    const message: ErrorMessage = {
      id: randomUUID(),
      content_type: topic,
      metadata: {},
      created_at: new Date().toISOString(),
      created_by: SERVICE_FQN,
      error: error.name,
      message: error.message,
      correlation_id: origin.correlation_id,
    };

    await this.producer.publish<ErrorMessage>(topic, [message], origin.correlation_id);
  }
}
