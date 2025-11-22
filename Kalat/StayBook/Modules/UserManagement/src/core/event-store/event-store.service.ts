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
  ): Promise<void> {
    const uncommittedEvents = aggregate.getUncommittedEvents();
    const aggregateVersion = aggregate.getVersion();

    const storeVersion = await transaction.eventStore.count({
      where: { aggregateId: aggregate.getAggregateId() },
    });

    if (aggregateVersion !== storeVersion) {
      throw new ConcurrencyControlException(aggregateVersion, storeVersion);
    }

    let version = aggregateVersion;

    for (const event of uncommittedEvents) {
      version += 1;

      const id = randomUUID();
      const date = new Date();
      const contentType = `${SERVICE_FQN}.domain.${event.constructor.name}`;
      const createBy = 'TODO';

      const serialized = await this.serialize.serializeEvent(event);

      await transaction.eventStore.create({
        data: {
          id: id,
          aggregateId: aggregate.getAggregateId(),
          aggregateType: aggregate.getAggregateType(),
          contentType: contentType,
          content: new Uint8Array(serialized),
          createdAt: date,
          createdBy: createBy,
          metadata: {},
          version: version,
        },
      });
    }
  }

  async findEventByAggregate(aggregateId: string): Promise<DomainEvent[]> {
    const events = await this.prisma.eventStore.findMany({
      where: { aggregateId: aggregateId },
      orderBy: { version: 'asc' },
    });

    const domainEvents: DomainEvent[] = [];
    for (const event of events)
      domainEvents.push({
        id: event.id,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        contentType: event.contentType,
        content: await this.serialize.deserializeEvent(Buffer.from(event.content), event.contentType),
        createdAt: event.createdAt,
        createdBy: event.createdBy,
        metadata: {},
        version: event.version,
      });

    return domainEvents;
  }
}
