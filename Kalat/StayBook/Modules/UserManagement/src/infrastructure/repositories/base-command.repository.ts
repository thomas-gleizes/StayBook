import { PrismaService } from '../../core/prisma/prisma.service';
import { EventPublisher } from '@nestjs/cqrs';
import { EventStoreService } from '../../core/event-store/event-store.service';
import { CommandRepositoryPort } from '../../domain/repostiories/base-command-repository.port';
import { AggregateRoot } from '../../core/interface/aggregate-root';

export abstract class BaseCommandRepository<TAggregate extends AggregateRoot>
  implements CommandRepositoryPort<TAggregate>
{
  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly eventStore: EventStoreService,
    private readonly publisher: EventPublisher,
  ) {}

  async persist(aggregate: TAggregate) {
    await this.prisma.$transaction(async (transaction) => {
      await this.eventStore.save(transaction, aggregate);
      this.publisher.mergeObjectContext(aggregate).commit();
    });
  }

  abstract findById(id: string): Promise<TAggregate | null>;
}
