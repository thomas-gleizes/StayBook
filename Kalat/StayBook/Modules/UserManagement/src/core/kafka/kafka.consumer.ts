import { Consumer, IHeaders, Kafka } from 'kafkajs';
import { Inject, Logger } from '@nestjs/common';
import { KAFKA_BROKER } from './kafka.token';
import { SERVICE_FQN } from '../config/constants';
import { BaseMessage, RawBaseMessage } from '../messaging/messaging.interface';
import { Serializer } from '../seralizer/serializer.service';
import { options } from 'yargs';
import { environment } from '../config/environment';

export type MessageHandler<TMessage extends RawBaseMessage> = (message: {
  topic: string;
  value: TMessage;
  headers: Record<string, string | boolean | number>;
}) => Promise<void> | void;

export type ConsumerOptions = {
  fromBeginning: boolean;
};

export class KafkaConsumer {
  private readonly logger = new Logger('Consumer');
  private readonly consumer: Consumer;
  private readonly handlers = new Map<
    string,
    { options: ConsumerOptions; handler: MessageHandler<RawBaseMessage> }
  >();

  constructor(
    @Inject(KAFKA_BROKER)
    broker: Kafka,
    private readonly serializer: Serializer,
  ) {
    this.consumer = broker.consumer({
      groupId: SERVICE_FQN,
      heartbeatInterval: 10_000,
      sessionTimeout: 40_000,
    });
  }

  async subscribe<TMessage extends RawBaseMessage>(
    topics: string[],
    options: ConsumerOptions,
    handler: MessageHandler<TMessage>,
  ) {
    for (const topic of topics) {
      if (this.handlers.has(topic)) throw new Error('TOPIC IS ALREADY DEFINE');

      this.handlers.set(topic, { options, handler });
    }
  }

  async run() {
    for (const [topic, { options }] of this.handlers) {
      await this.consumer.subscribe({ topic, ...options });
    }

    await this.consumer.connect();
    await this.consumer.run({
      autoCommit: false,
      partitionsConsumedConcurrently: environment.KAFKA_PARTITION_CONSUME_CONCURRENCY,
      eachMessage: async ({ topic, message, partition, heartbeat }) => {
        const interval = setInterval(() => void heartbeat(), 5000);

        try {
          if (!message.value) return;

          this.logger.debug(`Consume - ${topic}, (partition = ${partition}, offset = ${message.offset})`);

          const value = await this.serializer.deserializeMessage(message.value);

          const handler = this.handlers.get(topic);
          if (!handler) return this.logger.warn(`NO HANDLER FOUND FOR '${topic}'`);

          const headers = this.parseHeaders(message.headers);

          value.metadata = JSON.stringify(headers);

          await handler.handler({ topic, value, headers });
          await this.consumer.commitOffsets([
            { topic, partition, offset: (Number(message.offset) + 1).toString() },
          ]);
        } catch (error) {
          this.logger.error(`FAILED ON MESSAGE CONSUMING ${topic}`, error);
        } finally {
          clearInterval(interval);
        }
      },
    });
  }

  private parseHeaders(headers?: IHeaders): { [key: string]: string | boolean | number } {
    if (!headers) return {};

    const parsed = {};

    for (const [key, value] of Object.entries(headers)) {
      if (value) parsed[key] = value?.toString();
    }

    return parsed;
  }
}
