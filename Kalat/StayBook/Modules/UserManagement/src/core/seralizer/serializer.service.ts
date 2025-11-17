// TODO: switch to protobuf or equivalent

import { Injectable, Type } from '@nestjs/common';
import { BaseEvent } from '../interface/base-event.interface';
import {
  DomainEvent,
  ErrorMessage,
  RawData,
  RawDomainEvent,
  RawErrorMessage,
  RawReplyMessage,
  ReplyMessage,
} from '../messaging/messaging.interface';
import { UserEvents } from '../../domain/events';
import { SERVICE_FQN } from '../config/constants';

@Injectable()
export class Serializer {
  private static EVENTS = [...UserEvents];

  serializeEvent(event: DomainEvent): RawDomainEvent {
    return {
      id: event.id,
      aggregate_id: event.aggregateId,
      aggregate_type: event.aggregateType,
      content_type: event.contentType,
      created_by: event.createdBy,
      metadata: event.metadata,
      state: { ...event.state },
      version: event.version,
      created_at: event.createdAt.toISOString(),
    };
  }

  deserializeEvent(raw: RawDomainEvent): DomainEvent {
    const eventName = raw.content_type.replace(`${SERVICE_FQN}.domain.`, '');
    const eventType = Serializer.EVENTS.find((eventType) => eventType.name === eventName);

    console.log('EventType', eventType);
    console.log('EventName', eventName);
    console.log('Serializer.EVENTS', Serializer.EVENTS);

    if (!eventType) throw new Error('EVENT NOT deserializable');

    return {
      id: raw.id,
      aggregateId: raw.aggregate_id,
      aggregateType: raw.aggregate_type,
      contentType: raw.content_type,
      createdAt: new Date(raw.created_at),
      createdBy: raw.created_by,
      metadata: raw.metadata,
      state: this.reconstructClass(eventType, raw.state),
      version: 0,
    };
  }

  serializeReply(message: ReplyMessage<any>): RawReplyMessage {
    return {
      id: message.id,
      content_type: message.contentType,
      correlationId: message.correlationId,
      created_at: message.createdAt.toISOString(),
      created_by: message.createdBy,
      metadata: message.metadata,
      payload: { ...message.payload },
    };
  }

  serializeError(message: ErrorMessage): RawErrorMessage {
    return {
      id: message.id,
      content_type: message.contentType,
      correlation_id: message.correlationId,
      created_at: message.createdAt.toISOString(),
      created_by: message.createdBy,
      error: message.error,
      message: message.message,
      metadata: message.metadata,
    };
  }

  reconstructClass<TEvent extends BaseEvent>(EventClass: Type<TEvent>, data: RawData): TEvent {
    if (typeof data === 'object' && data !== null)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Object.assign(Object.create(EventClass.prototype), data);

    return new EventClass(data);
  }
}
