import { IProjectionHandler, Projection } from '../../core/projections/projection.decorator';
import { UserCreatedEvent } from '../../domain/events/users/user-created.event';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DomainEvent } from '../../core/messaging/messaging.interface';

@Projection(UserCreatedEvent)
export class UserCreatedProjection implements IProjectionHandler<UserCreatedEvent> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: DomainEvent<UserCreatedEvent>): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: event.state.userId,
        firstName: event.state.firstName,
        lastName: event.state.lastName,
        email: event.state.email,
      },
    });
  }
}
