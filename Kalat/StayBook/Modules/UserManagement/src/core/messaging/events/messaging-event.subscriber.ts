import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { RegistererService } from '../../registerer/registerer.service';
import { SERVICE_FQN } from '../../config/constants';
import { RawDomainEvent } from '../messaging.interface';
import { Serializer } from '../../seralizer/serializer.service';
import { ProjectionService } from '../../projections/projection.service';

@Injectable()
export class MessagingEventSubscriber implements OnModuleInit {
  private readonly logger = new Logger('EventSubscriber');

  private static AGGREGATES = ['User'];

  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly serializer: Serializer,
    private readonly projections: ProjectionService,
  ) {}

  async onModuleInit() {
    await this.subscribe();
  }

  async subscribe() {
    const topics = MessagingEventSubscriber.AGGREGATES.map(
      (aggregate) => `${SERVICE_FQN}.domain.${aggregate}`,
    );

    this.logger.log(`Listen to topics: ${topics.join(', ')}`);

    await this.consumer.subscribe<RawDomainEvent>(topics, { fromBeginning: true }, async (topic, message) => {
      const event = await this.serializer.deserializeEvent(message);

      this.logger.debug(`Handle - ${message.contentType} - ${message.id}`, event);

      await this.projections.execute(event.content);
    });
  }
}
