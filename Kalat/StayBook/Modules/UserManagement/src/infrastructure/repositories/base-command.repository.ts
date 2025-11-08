import { BaseEvent } from '../../shared/interface/base-event.interface';
import { BaseAggregateRoot } from '../../shared/interface/base-aggregate-root';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Logger, Type } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { EventStoreService } from '../../shared/event-store/event-store.service';
import { CommandRepositoryPort } from '../../domain/repostiories/base-command-repository.port';

export type Persistor<Event extends BaseEvent> = (
  transaction: Prisma.TransactionClient,
  event: Event,
) => Promise<void>;

export abstract class BaseCommandRepository<TAggregate extends BaseAggregateRoot>
  implements CommandRepositoryPort<TAggregate>
{
  private readonly logger = new Logger('COMMAND_REPOSITORY');
  private readonly viewPersistors = new Map<string, Persistor<BaseEvent>>();

  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly eventStore: EventStoreService,
    private readonly publisher: EventPublisher,
  ) {}

  setPersistor<Event extends BaseEvent>(event: Type<Event>, persistor: Persistor<Event>) {
    this.viewPersistors.set(event.name, persistor);
  }

  async persist(aggregate: TAggregate) {
    const uncommittedEvents = aggregate.getUncommittedEvents();

    await this.prisma.$transaction(async (transaction) => {
      await Promise.all([
        this.runViewPersistor(transaction, uncommittedEvents),
        this.eventStore.save(transaction, aggregate),
      ]);

      this.publisher.mergeObjectContext(aggregate).commit();
    });
  }

  private async runViewPersistor(transaction: Prisma.TransactionClient, events: BaseEvent[]) {
    for (const event of events) {
      const persistor = this.viewPersistors.get(event.constructor.name);

      if (!persistor) {
        this.logger.warn(`NO PERSISTOR FOR ${event.constructor.name}`);
        continue;
      }

      await persistor(transaction, event);
    }
    return Promise.resolve();
  }

  abstract findById(id: string): Promise<TAggregate | null>;
}
