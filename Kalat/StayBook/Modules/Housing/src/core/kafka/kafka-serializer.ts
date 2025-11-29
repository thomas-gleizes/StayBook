import { BaseMessage, Serializer as StayBookSerializer } from '@staybook/serializer';
import { Serializer } from '@nestjs/microservices';

export class KafkaSerializer<TMessage extends BaseMessage> implements Serializer<TMessage, Buffer> {
  serialize(value: unknown, options?: Record<string, any>): Buffer {
    console.log('serialize', value, options);

    return Buffer.from(JSON.stringify(value));
  }
}
