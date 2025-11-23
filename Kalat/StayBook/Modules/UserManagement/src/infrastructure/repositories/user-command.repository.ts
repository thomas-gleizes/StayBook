import { UserAggregate } from 'src/domain/aggregates/user.aggregate';
import { IUserCommandRepository } from '../../domain/repostiories/user-command.repostiory';
import { BaseCommandRepository } from './base-command.repository';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { EventStoreService } from '../../core/event-store/event-store.service';

@Injectable()
export class UserCommandRepository
  extends BaseCommandRepository<UserAggregate>
  implements IUserCommandRepository
{
  constructor(prisma: PrismaService, eventStore: EventStoreService, publisher: EventPublisher) {
    super(prisma, eventStore, publisher);
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const events = await this.eventStore.findEventByAggregate(id);

    if (!events.length) return null;

    const aggregate = new UserAggregate();

    aggregate.loadFromHistory(events.map((event) => event.content));

    return aggregate;
  }
}
