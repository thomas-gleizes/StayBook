// TODO: switch to protobuf or equivalent

import { Injectable, Logger } from '@nestjs/common';
import { BaseEvent } from '../interface/base-event.interface';
import {
  ErrorMessage,
  RawErrorMessage,
  RawReplyMessage,
  ReplyMessage,
} from '../messaging/messaging.interface';
import { UserEvents } from '../../domain/events';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { environment } from '../config/environment';

@Injectable()
export class Serializer {
  private readonly logger = new Logger(Serializer.name);
  private readonly registry: SchemaRegistry;

  constructor() {
    this.registry = new SchemaRegistry({ host: environment.SCHEMA_REGISTER_URL });
  }

  private static EVENTS = [...UserEvents];

  async serializeEvent(event: BaseEvent): Promise<Buffer> {
    try {
      this.logger.debug(`Serialize ${event.constructor.name}`);

      const schemaId = await this.registry.getLatestSchemaId(event.constructor.name);

      return await this.registry.encode(schemaId, event);
    } catch (error) {
      this.logger.error('Failed to serialize event', error);
      throw error;
    }
  }

  async deserializeEvent<TEvent extends BaseEvent = BaseEvent>(
    raw: Buffer,
    contentType: string,
  ): Promise<TEvent> {
    this.logger.debug(`Deserialize ${contentType}`);
    return this.registry.decode(raw);
  }

  serializeReply(message: ReplyMessage<any>): RawReplyMessage {
    return {
      id: message.id,
      contentType: message.contentType,
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
      contentType: message.contentType,
      correlationId: message.correlationId,
      created_at: message.createdAt.toISOString(),
      created_by: message.createdBy,
      error: message.error,
      message: message.message,
      metadata: message.metadata,
    };
  }
}
