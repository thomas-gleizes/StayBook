import { Consumer, Kafka } from 'kafkajs';
import { Inject, Logger } from '@nestjs/common';
import { KAFKA_BROKER } from './kafka.token';
import { SERVICE_FQN } from '../config/constants';
import { BaseMessage } from '../messaging/messaging.interface';

export type MessageHandler<TMessage extends BaseMessage> = (
  topic: string,
  message: TMessage,
) => Promise<void> | void;

export class KafkaConsumer {
  private readonly logger = new Logger('CONSUMER');
  private readonly consumer: Consumer;
  private readonly handlers = new Map<string, MessageHandler<BaseMessage>>();

  constructor(
    @Inject(KAFKA_BROKER)
    broker: Kafka,
  ) {
    this.consumer = broker.consumer({
      groupId: SERVICE_FQN,
      heartbeatInterval: 10_000,
      sessionTimeout: 40_000,
    });
  }

  async subscribe<TMessage extends BaseMessage>(
    options: { topics: string[]; fromBeginning: boolean },
    handler: MessageHandler<TMessage>,
  ) {
    for (const topic of options.topics) {
      if (this.handlers.has(topic)) throw new Error('TOPIC IS ALREADY DEFINE');

      this.handlers.set(topic, handler);
    }

    await this.consumer.subscribe(options);
  }

  async run() {
    await this.consumer.connect();
    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, message, heartbeat }) => {
        const interval = setInterval(heartbeat, 1000);

        try {
          if (!message.value) return;

          const value = JSON.parse(message.value.toString()) as BaseMessage;
          const handler = this.handlers.get(topic);
          if (!handler) return this.logger.warn(`NO HANDLER FOUND FOR '${topic}'`);

          await handler(topic, value);
        } catch (error) {
          this.logger.error(`FAILED ON MESSAGE CONSUMING ${topic}`, error);
        } finally {
          clearInterval(interval);
        }
      },
    });
  }
}
