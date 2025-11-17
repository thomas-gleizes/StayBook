import { Injectable, Type } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEvent } from '../messaging/messaging.interface';
import { Prisma } from '../../../generated/prisma/client';
import { BaseEvent } from '../interface/base-event.interface';
import { Events } from '../../domain/events';
import { randomUUID } from 'crypto';
import { SERVICE_FQN } from '../config/constants';
import { OutboxService } from '../outbox/outbox.service';
import { ConcurrencyControlException } from '../../infrastructure/exceptions/concurrency-control.exception';
import { Serializer } from '../seralizer/serializer.service';
import { AggregateRoot } from '../interface/aggregate-root';

@Injectable()
export class EventStoreService {
  private readonly eventMap = new Map<string, Type<BaseEvent>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly serialize: Serializer,
  ) {
    for (const Event of Events) {
      this.eventMap.set(`${SERVICE_FQN}.domain.${Event.name}`, Event);
    }
  }

  async save<TAggregate extends AggregateRoot>(
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
      contentType: `${SERVICE_FQN}.domain.${event.constructor.name}`,
      createdAt: new Date(),
      createdBy: SERVICE_FQN,
      metadata: {},
      aggregateType: `${SERVICE_FQN}.domain.${aggregate.getAggregateType()}`,
      aggregateId: aggregate.getAggregateId(),
      version: version + index,
      state: event,
    }));

    console.log('StorableEvents', storableEvents);

    await Promise.all([
      transaction.eventStore.createMany({
        data: storableEvents.map((event) => this.serialize.serializeEvent(event)),
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

    // TODO: temporary: its will be fix with real serializer
    // @ts-ignore
    return events.map<DomainEvent>((event) => this.serialize.deserializeEvent(event));
  }
}
