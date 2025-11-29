import { BaseMessage, Serializer } from '@staybook/serializer';
import { Deserializer } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

export type Input = {
  magicByte: number;
  attributes: number;
  timestamp: number;
  offset: number;
  key: string | null;
  value: Buffer;
  headers: { [key: string]: string };
  isControlRecord: boolean;
  topic: string;
  partition: number;
  batchContext: { [key: string]: unknown };
};

export class KafkaDeserializer implements Deserializer {
  private readonly logger = new Logger(KafkaDeserializer.name);
  private readonly serializer: Serializer;

  constructor(host: string) {
    this.serializer = new Serializer(new SchemaRegistry({ host }));
  }

  async deserialize<T extends BaseMessage>(input: Input): Promise<{ data: T; pattern: string }> {
    console.log('Input', input);

    const rawMessage = await this.serializer.deserializeMessage(input.value);
    const message = await this.serializer.deserializePayload(rawMessage);

    console.log('Message', message);

    return {
      pattern: input.topic,
      // @ts-ignore
      data: message,
    };
  }
}
