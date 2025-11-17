import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducer } from '../kafka/kafka.producer';
import {
  ActionMessage,
  ErrorMessage,
  RawDomainEvent,
  RawErrorMessage,
  RawReplyMessage,
  ReplyMessage,
} from './messaging.interface';
import { SERVICE_FQN } from '../config/constants';
import { randomUUID } from 'crypto';
import { Serializer } from '../seralizer/serializer.service';

@Injectable()
export class MessagingPublisher {
  private readonly logger = new Logger(MessagingPublisher.name);

  constructor(
    private readonly producer: KafkaProducer,
    private readonly serialize: Serializer,
  ) {}

  async publishEvent(events: RawDomainEvent[]) {
    const [event] = events;
    this.logger.debug(
      `Publishing ${events.length} event(s) to topic "${event.aggregate_type}" for aggregate ID "${event.aggregate_id}"`,
    );

    await this.producer.publish(event.aggregate_type, events, event.aggregate_id);
  }

  async publishReply<Payload = unknown>(payload: Payload, origin: ActionMessage) {
    const message: ReplyMessage<Payload> = {
      id: randomUUID(),
      contentType: origin.replyTo,
      metadata: {},
      createdBy: SERVICE_FQN,
      createdAt: new Date(),
      payload: payload,
      correlationId: origin.correlationId,
    };

    await this.producer.publish<RawReplyMessage>(
      origin.replyTo,
      [this.serialize.serializeReply(message)],
      origin.correlationId,
    );
  }

  async publishError(error: Error, origin: ActionMessage) {
    const topic = `${SERVICE_FQN}.error`;

    const message: ErrorMessage = {
      id: randomUUID(),
      contentType: topic,
      metadata: {},
      createdAt: new Date(),
      createdBy: SERVICE_FQN,
      error: error.name,
      message: error.message,
      correlationId: origin.correlationId,
    };

    await this.producer.publish<RawErrorMessage>(
      topic,
      [this.serialize.serializeError(message)],
      origin.correlationId,
    );
  }
}
