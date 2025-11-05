import { BaseEvent } from './base-event.interface';
import { BaseAggregateRoot } from './base-aggregate-root';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Type } from '@nestjs/common';
import { MessagingPublisher } from '../messaging/messaging.publisher';
import { DomainEvent } from '../messaging/messaging.interface';
import { randomUUID } from 'crypto';
import { SERVICE_NOMENCLATURE } from '../config/constants';

export type Persistor<Event extends BaseEvent> = (
  transaction: Prisma.TransactionClient,
  event: Event,
) => any | Promise<any>;

export abstract class BaseCommandRepository<Aggregate extends BaseAggregateRoot> {
  private readonly persistors = new Map<Type<BaseEvent>, Persistor<BaseEvent>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly publisher: MessagingPublisher,
  ) {}

  setPersistor<Event extends BaseEvent>(event: Type<Event>, persistor: Persistor<Event>) {
    this.persistors.set(event, persistor);
  }

  async persist(aggregate: Aggregate) {
    const events = aggregate.getUncommittedEvents();

    await this.prisma.$transaction(async (transaction) => {
      const storableEvents = events.map<DomainEvent>((event, index) => ({
        id: randomUUID(),
        content_type: `${SERVICE_NOMENCLATURE}.domain.${event.constructor.name}`,
        created_at: new Date().toISOString(),
        created_by: SERVICE_NOMENCLATURE,
        metadata: {},
        aggregate_type: `${SERVICE_NOMENCLATURE}.domain.${aggregate.getAggregateType()}`,
        aggregate_id: aggregate.getAggregateId(),
        version: index,
        state: event,
      }));

      for (const event of events) {
        console.log('Event', event);

        // @ts-ignore
        const persistor = this.persistors.get(event.constructor.name);
        console.log('Persistor', persistor);

        if (persistor) {
          persistor(transaction, event);
        }
      }

      await this.publisher.publishEvent(storableEvents);

      aggregate.commit();
    });
  }
}
