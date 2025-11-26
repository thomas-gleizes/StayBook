import { Injectable } from '@nestjs/common';
import { BaseEvent } from '../interface/base-event.interface';
import {
  DomainEvent,
  QueryMessage,
  RawActionMessage,
  RawBaseMessage,
  RawDomainEvent,
} from '../messaging/messaging.interface';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { environment } from '../config/environment';
import { IQuery } from '@nestjs/cqrs';

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
    message: RawDomainEvent,
  ): Promise<DomainEvent<TEvent>> {
    const content = (await this.registry.decode(message.content)) as TEvent;

    return {
      id: message.id,
      aggregateId: message.aggregateId,
      aggregateType: message.aggregateType,
      content: content,
      contentType: message.contentType,
      createdAt: new Date(message.createdAt),
      createdBy: message.createdBy,
      metadata: JSON.parse(message.metadata),
      version: message.version,
    };
  }

  async deserializeQuery<TQuery extends IQuery = IQuery>(
    message: RawActionMessage,
  ): Promise<QueryMessage<TQuery>> {
    const payload = (await this.registry.decode(message.payload)) as TQuery;

    return {
      id: message.id,
      contentType: message.contentType,
      correlationId: message.correlationId,
      createdAt: new Date(message.createdAt),
      createdBy: message.createdBy,
      metadata: JSON.parse(message.metadata),
      payload: payload,
      replyTo: message.replyTo,
    };
  }
}
