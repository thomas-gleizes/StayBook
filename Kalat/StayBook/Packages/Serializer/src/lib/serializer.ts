import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { BaseMessage, RawBaseMessage } from "./serializer.types";
import { parseFQN } from "../utils/parse-fqn";

export class Serializer {
  constructor(private readonly registry: SchemaRegistry) {}

  async serializeMessage<TMessage extends RawBaseMessage>(
    message: TMessage,
  ): Promise<Buffer> {
    const fqn = parseFQN(message.contentType);

    const schemaId = await this.registry.getLatestSchemaId(
      this.capitalize(fqn.actionType!),
    );

    return this.registry.encode(schemaId, message);
  }

  async deserializeMessage<TMessage extends RawBaseMessage>(
    message: Buffer,
  ): Promise<TMessage> {
    return this.registry.decode(message);
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async serializePayload<T extends Object, M extends BaseMessage<T>>(
    message: M,
  ): Promise<RawBaseMessage> {
    const schemaId = await this.registry.getLatestSchemaId(
      message.payload.constructor.name,
    );

    return {
      ...message,
      createdAt: message.createdAt.toISOString(),
      metadata: JSON.stringify(message.metadata),
      payload: await this.registry.encode(schemaId, message.payload),
    };
  }

  async deserializePayload<T extends Object, R extends BaseMessage<T>>(
    message: RawBaseMessage,
  ): Promise<R> {
    return {
      ...message,
      createdAt: new Date(message.createdAt),
      metadata: JSON.parse(message.metadata),
      payload: await this.registry.decode(message.payload),
    } as R;
  }
}
