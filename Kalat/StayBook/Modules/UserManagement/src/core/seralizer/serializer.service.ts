import { Injectable } from '@nestjs/common';
import { BaseEvent } from '../interface/base-event.interface';
import { RawBaseMessage } from '../messaging/messaging.interface';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { environment } from '../config/environment';

@Injectable()
export class Serializer {
  private readonly registry: SchemaRegistry;

  constructor() {
    this.registry = new SchemaRegistry({ host: environment.SCHEMA_REGISTER_URL });
  }

  async serializeMessage<TMessage extends RawBaseMessage>(message: TMessage) {
    const schemaId = await this.registry.getLatestSchemaId('DomainEvent');

    return this.registry.encode(schemaId, message);
  }

  async deserializeMessage<TMessage extends RawBaseMessage>(buffer: Buffer): Promise<TMessage> {
    return this.registry.decode(buffer);
  }

  async serializeEvent<TEvent extends BaseEvent>(event: TEvent): Promise<Buffer> {
    const schemaId = await this.registry.getLatestSchemaId(event.constructor.name);

    return await this.registry.encode(schemaId, event);
  }

  async deserializeEvent<TEvent extends BaseEvent = BaseEvent>(raw: Buffer): Promise<TEvent> {
    return (await this.registry.decode(raw)) as TEvent;
  }
}
