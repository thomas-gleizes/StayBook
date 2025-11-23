import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DomainEvent, RawDomainEvent } from '../messaging/messaging.interface';
import { MessageStatus, MessageType, Prisma } from '../../../generated/prisma/client';
import { randomUUID } from 'crypto';
import { SERVICE_FQN } from '../config/constants';
import { ConcurrencyControlException } from '../../infrastructure/exceptions/concurrency-control.exception';
import { Serializer } from '../seralizer/serializer.service';
import { AggregateRoot } from '../interface/aggregate-root';

@Injectable()
export class EventStoreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serialize: Serializer,
  ) {}

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

      const domainEvent: DomainEvent = {
        id: randomUUID(),
        aggregateId: aggregate.getAggregateId(),
        aggregateType: aggregate.getAggregateType(),
        content: event,
        contentType: `${SERVICE_FQN}.domain.${event.constructor.name}`,
        createdAt: new Date(),
        createdBy: 'TODO',
        metadata: { tenantId: randomUUID() },
        version: version,
      };

      const rawDomainEvent = await this.serialize.serializeEvent(domainEvent);

      await transaction.eventStore.create({
        data: {
          id: rawDomainEvent.id,
          aggregateId: rawDomainEvent.aggregateId,
          aggregateType: rawDomainEvent.aggregateType,
          contentType: rawDomainEvent.contentType,
          content: new Uint8Array(rawDomainEvent.content),
          createdAt: rawDomainEvent.createdAt,
          createdBy: rawDomainEvent.createdBy,
          metadata: rawDomainEvent.metadata,
          version: rawDomainEvent.version,
        },
      });

      const serialized = await this.serialize.serializeMessage(rawDomainEvent);

      await transaction.outboxMessage.create({
        data: {
          id: rawDomainEvent.id,
          correlationId: rawDomainEvent.aggregateId,
          message: new Uint8Array(serialized),
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
    for (const event of events) {
      domainEvents.push(
        await this.serialize.deserializeEvent({
          id: event.id,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          contentType: event.contentType,
          content: Buffer.from(event.content),
          createdAt: event.createdAt.toISOString(),
          createdBy: event.createdBy,
          metadata: JSON.stringify(event.metadata),
          version: event.version,
        }),
      );
    }

    return domainEvents;
  }
}
