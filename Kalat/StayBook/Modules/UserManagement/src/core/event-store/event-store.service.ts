import { Injectable, Type } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEvent, RawDomainEvent } from '../messaging/messaging.interface';
import { MessageStatus, MessageType, Prisma } from '../../../generated/prisma/client';
import { BaseEvent } from '../interface/base-event.interface';
import { Events } from '../../domain/events';
import { randomUUID } from 'crypto';
import { SERVICE_FQN } from '../config/constants';
import { OutboxService } from '../outbox/outbox.service';
import { ConcurrencyControlException } from '../../infrastructure/exceptions/concurrency-control.exception';
import { Serializer } from '../seralizer/serializer.service';
import { AggregateRoot } from '../interface/aggregate-root';
import { ag } from '@faker-js/faker/dist/airline-DF6RqYmq';

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

      const eventId = randomUUID();
      const contentType = `${SERVICE_FQN}.domain.${event.constructor.name}`;
      const createdAt = new Date();
      const createBy = 'TODO';

      const serialized = await this.serialize.serializeEvent(event);

      const message: RawDomainEvent = {
        id: eventId,
        aggregateId: aggregate.getAggregateId(),
        aggregateType: aggregate.getAggregateType(),
        content: serialized,
        contentType: contentType,
        createdAt: createdAt.toISOString(),
        createdBy: createBy,
        metadata: JSON.stringify({ tenantId: randomUUID() }),
        version: version,
      };

      const fullMessage = await this.serialize.serializeMessage(message);

      await transaction.eventStore.create({
        data: {
          id: eventId,
          aggregateId: aggregate.getAggregateId(),
          aggregateType: aggregate.getAggregateType(),
          contentType: contentType,
          content: new Uint8Array(serialized),
          createdAt: createdAt,
          createdBy: createBy,
          metadata: {},
          version: version,
        },
      });

      await transaction.outboxMessage.create({
        data: {
          id: eventId,
          correlationId: aggregate.getAggregateId(),
          message: new Uint8Array(fullMessage),
          topic: `${SERVICE_FQN}.domain.${aggregate.getAggregateType()}`,
          status: MessageStatus.PENDING,
          type: MessageType.EVENT,
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
        content: await this.serialize.deserializeEvent(Buffer.from(event.content)),
        createdAt: event.createdAt,
        createdBy: event.createdBy,
        metadata: {},
        version: event.version,
      });

    return domainEvents;
  }
}
