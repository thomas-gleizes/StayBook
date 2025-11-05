import { UserAggregate } from 'src/domain/aggregates/user.aggregate';
import { IUserCommandRepository } from '../../domain/repostiories/user-command.repostiory';
import { BaseCommandRepository } from '../../shared/interface/base-command.repository';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MessagingPublisher } from '../../shared/messaging/messaging.publisher';

@Injectable()
export class UserCommandRepository
  extends BaseCommandRepository<UserAggregate>
  implements IUserCommandRepository
{
  constructor(prisma: PrismaService, publisher: MessagingPublisher) {
    super(prisma, publisher);

    this.setPersistor<UserCreatedEvent>(UserCreatedEvent, async (transaction, event) => {
      await transaction.user.create({
        data: {
          id: event.id,
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
        },
      });
    });
  }
}
