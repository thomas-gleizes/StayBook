import { Injectable, Type } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEvent } from '../messaging/messaging.interface';
import { Prisma } from '../../../generated/prisma/client';
import { BaseEvent } from '../interface/base-event.interface';
import { Events } from '../../domain/events';
import { BaseAggregateRoot } from '../interface/base-aggregate-root';
import { randomUUID } from 'crypto';
import { SERVICE_FQN } from '../config/constants';
import { OutboxService } from '../outbox/outbox.service';
import { ConcurrencyControlException } from '../../infrastructure/exceptions/concurrency-control.exception';

@Injectable()
export class EventStoreService {
  private readonly eventMap = new Map<string, Type<BaseEvent>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {
    for (const Event of Events) {
      this.eventMap.set(`${SERVICE_FQN}.domain.${Event.name}`, Event);
    }
  }

  async save<TAggregate extends BaseAggregateRoot>(
    transaction: Prisma.TransactionClient,
    aggregate: TAggregate,
  ): Promise<DomainEvent[]> {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    const version = aggregate.getVersion();

    const storeVersion = await transaction.eventStore.count({
      where: { aggregate_id: aggregate.getAggregateId() },
    });

    if (version !== storeVersion) {
      throw new ConcurrencyControlException(version, storeVersion);
    }

    const storableEvents = uncommittedEvents.map<DomainEvent>((event, index) => ({
      id: randomUUID(),
      content_type: `${SERVICE_FQN}.domain.${event.constructor.name}`,
      created_at: new Date().toISOString(),
      created_by: SERVICE_FQN,
      metadata: {},
      aggregate_type: `${SERVICE_FQN}.domain.${aggregate.getAggregateType()}`,
      aggregate_id: aggregate.getAggregateId(),
      version: version + index,
      state: event,
    }));

    await Promise.all([
      transaction.eventStore.createMany({
        data: storableEvents.map((event) => ({
          id: event.id,
          content_type: event.content_type,
          created_at: event.created_at,
          created_by: event.created_by,
          aggregate_type: event.aggregate_type,
          aggregate_id: event.aggregate_id,
          version: event.version,
          state: { ...event.state },
        })),
      }),
      this.outbox.saveEvents(transaction, storableEvents),
    ]);

    return storableEvents;
  }

  async findEventByAggregate(aggregateId: string): Promise<DomainEvent[]> {
    const events = await this.prisma.eventStore.findMany({
      where: { aggregate_id: aggregateId },
      orderBy: { version: 'asc' },
    });

    return events.map<DomainEvent>((event) => {
      const type = this.eventMap.get(event.content_type);

      if (!type) throw new Error(`EVENT TYPE UNKNOW : ${event.content_type}`);

      return {
        id: event.id,
        content_type: event.content_type,
        version: event.version,
        state: this.reconstructEvent(type, event.state),
        aggregate_id: event.aggregate_id,
        aggregate_type: event.aggregate_type,
        created_at: event.created_at.toISOString(),
        created_by: event.created_by,
        metadata: {},
      };
    });
  }

  private reconstructEvent<TEvent extends BaseEvent>(
    EventClass: Type<TEvent>,
    state: Prisma.JsonValue,
  ): TEvent {
    if (typeof state === 'object' && state !== null)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Object.assign(Object.create(EventClass.prototype), state);

    return new EventClass(state);
  }
}
