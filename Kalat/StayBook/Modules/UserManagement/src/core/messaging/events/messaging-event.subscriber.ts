import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { KafkaConsumer } from '../../kafka/kafka.consumer';
import { RegistererService } from '../../registerer/registerer.service';
import { IProjectionHandler, PROJECTION_HANDLER_METADATA } from '../../projections/projection.decorator';
import { BaseEvent } from '../../interface/base-event.interface';
import { SERVICE_FQN } from '../../config/constants';
import { RawDomainEvent } from '../messaging.interface';
import { Serializer } from '../../seralizer/serializer.service';

@Injectable()
export class MessagingEventSubscriber implements OnModuleInit {
  private readonly logger = new Logger('EventSubscriber');

  private static AGGREGATES = ['User'];

  private readonly projections = new Map<string, { event: Type<BaseEvent>; handler: IProjectionHandler }>();

  constructor(
    private readonly consumer: KafkaConsumer,
    private readonly register: RegistererService,
    private readonly serializer: Serializer,
  ) {}

  async onModuleInit() {
    const projections = this.register.findByMetadata<Type<BaseEvent>>(PROJECTION_HANDLER_METADATA);

    for (const [handler, event] of projections) {
      this.projections.set(event.name, { event, handler: handler.instance });
    }

    await this.subscribe();
  }

  async subscribe() {
    const topics = MessagingEventSubscriber.AGGREGATES.map(
      (aggregate) => `${SERVICE_FQN}.domain.${aggregate}`,
    );

    this.logger.log(`Listen to topics: ${topics.join(', ')}`);

    await this.consumer.subscribe<RawDomainEvent>(
      { topics: topics, fromBeginning: true },
      async (topic, message) => {
        this.logger.debug('Handle', topic);

        const event = await this.serializer.deserializeEvent(message.content);
        const projection = this.projections.get(event.constructor.name);

        if (!projection) return this.logger.debug('No projection found');

        await projection.handler.handle(event);
      },
    );
  }
}
