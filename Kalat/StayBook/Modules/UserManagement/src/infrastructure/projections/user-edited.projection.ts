import { IProjectionHandler, Projection } from '../../core/projections/projection.decorator';
import { UserEditedEvent } from '../../domain/events/users/user-edited.event';
import { PrismaService } from '../../core/prisma/prisma.service';

@Projection(UserEditedEvent)
export class UserEditedProjection implements IProjectionHandler<UserEditedEvent> {
  constructor(private readonly prisma: PrismaService) {}

  async handle(event: UserEditedEvent): Promise<void> {
    await this.prisma.user.update({
      where: { id: event.userId },
      data: {
        firstName: event.firstName,
        lastName: event.lastName,
      },
    });
  }
}
