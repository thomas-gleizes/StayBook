import { UserAggregate } from 'src/domain/aggregates/user.aggregate';
import { IUserCommandRepository } from '../../domain/repostiories/user-command.repostiory';
import { BaseCommandRepository } from './base-command.repository';
import { UserCreatedEvent } from '../../domain/events/users/user-created.event';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { EventStoreService } from '../../core/event-store/event-store.service';
import { UserEditedEvent } from '../../domain/events/users/user-edited.event';

@Injectable()
export class UserCommandRepository
  extends BaseCommandRepository<UserAggregate>
  implements IUserCommandRepository
{
  constructor(prisma: PrismaService, eventStore: EventStoreService, publisher: EventPublisher) {
    super(prisma, eventStore, publisher);

    this.setPersistor<UserCreatedEvent>(UserCreatedEvent, async (transaction, event) => {
      await transaction.user.create({
        data: {
          id: event.userId,
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
        },
      });
    });

    this.setPersistor<UserEditedEvent>(UserEditedEvent, async (transaction, event) => {
      await transaction.user.update({
        where: { id: event.userId },
        data: {
          firstName: event.firstName,
          lastName: event.lastName,
        },
      });
    });
  }

  async findById(id: string): Promise<UserAggregate | null> {
    const events = await this.eventStore.findEventByAggregate(id);

    if (!events.length) return null;

    const aggregate = new UserAggregate();

    aggregate.loadFromHistory(events.map((event) => event.content));

    return aggregate;
  }
}
