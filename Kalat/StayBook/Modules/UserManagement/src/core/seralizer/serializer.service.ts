import { Injectable } from '@nestjs/common';
import { BaseEvent } from '../interface/base-event.interface';
import { DomainEvent, RawBaseMessage, RawDomainEvent } from '../messaging/messaging.interface';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { environment } from '../config/environment';

@Injectable()
export class Serializer {
  private readonly registry: SchemaRegistry;

  constructor() {
    this.registry = new SchemaRegistry({ host: environment.SCHEMA_REGISTER_URL });
  }

  async serializeMessage<TMessage extends RawBaseMessage>(message: TMessage): Promise<Buffer> {
    const schemaId = await this.registry.getLatestSchemaId('DomainEvent');

    return this.registry.encode(schemaId, message);
  }

  async deserializeMessage<TMessage extends RawBaseMessage>(buffer: Buffer): Promise<TMessage> {
    return this.registry.decode(buffer);
  }

  async serializeEvent<TEvent extends BaseEvent>(event: DomainEvent<TEvent>): Promise<RawDomainEvent> {
    const schemaId = await this.registry.getLatestSchemaId(event.content.constructor.name);
    const buffer = await this.registry.encode(schemaId, event.content);

    return {
      id: event.id,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      content: buffer,
      contentType: event.contentType,
      createdAt: event.createdAt.toISOString(),
      createdBy: event.createdBy,
      metadata: JSON.stringify(event.metadata),
      version: event.version,
    };
  }

  async deserializeEvent<TEvent extends BaseEvent = BaseEvent>(
    event: RawDomainEvent,
  ): Promise<DomainEvent<TEvent>> {
    const content = (await this.registry.decode(event.content)) as TEvent;

    return {
      id: event.id,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      content: content,
      contentType: event.contentType,
      createdAt: new Date(event.createdAt),
      createdBy: event.createdBy,
      metadata: JSON.parse(event.metadata),
      version: event.version,
    };
  }
}
