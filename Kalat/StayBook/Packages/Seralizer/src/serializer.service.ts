import { Inject, Injectable } from "@nestjs/common";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import {
  DomainEvent,
  RawBaseMessage,
  RawDomainEvent,
} from "./serializer.types";

@Injectable()
export class Serializer {
  constructor(
    @Inject("REGISTRY")
    private readonly registry: SchemaRegistry,
  ) {}

  async serializeMessage<TMessage extends RawBaseMessage>(
    message: TMessage,
  ): Promise<Buffer> {
    const schemaId = await this.registry.getLatestSchemaId("Query");

    return this.registry.encode(schemaId, message);
  }

  async deserializeMessage<TMessage extends RawBaseMessage>(
    buffer: Buffer,
  ): Promise<TMessage> {
    return this.registry.decode(buffer);
  }

  async serializeEvent<TEvent extends Object>(
    event: DomainEvent<TEvent>,
  ): Promise<RawDomainEvent> {
    const schemaId = await this.registry.getLatestSchemaId(
      event.content.constructor.name,
    );
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

  async deserializeEvent<TEvent>(
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

  async serializeQuery<TQuery extends Object>(query: TQuery): Promise<Buffer> {
    const schemaId = await this.registry.getLatestSchemaId(
      query.constructor.name,
    );

    return this.registry.encode(schemaId, query);
  }

  async deserializeQuery<T>(queryReply: Buffer): Promise<T> {
    return this.registry.decode(queryReply);
  }
}
