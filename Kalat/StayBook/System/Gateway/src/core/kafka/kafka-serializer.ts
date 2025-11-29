import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Logger } from '@nestjs/common';
import { BaseMessage, Serializer } from '@staybook/serializer';

export class KafkaSerializer {
  private readonly logger = new Logger(KafkaSerializer.name);

  private readonly serializer: Serializer;

  constructor(host: string) {
    this.serializer = new Serializer(new SchemaRegistry({ host }));
  }

  async serialize(value: BaseMessage<any>, options?: Record<string, any>) {
    const topic = options?.pattern as string;

    this.logger.debug(`Serialize message to ${topic}`);
    console.log('Value', value);

    const rawMessage = await this.serializer.serializePayload(value);

    console.log('RawMessage', rawMessage);
    const message = await this.serializer.serializeMessage(rawMessage);

    console.log('Message', message);

    return {
      value: message,
      headers: {},
    };
  }
}
