import { IProjectionHandler, Projection } from '../../core/projections/projection.decorator';
import { UserCreatedEvent } from '../../domain/events/users/user-created.event';
import { PrismaService } from '../../core/prisma/prisma.service';

@Projection(UserCreatedEvent)
export class UserCreatedProjection implements IProjectionHandler<UserCreatedEvent> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: event.userId,
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
      },
    });
  }
}
