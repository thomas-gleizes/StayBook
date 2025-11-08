import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../domain/events/users/user-created.event';
import { Logger } from '@nestjs/common';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler {
  private readonly logger = new Logger(UserCreatedEvent.name);

  handle(event: UserCreatedEvent) {
    this.logger.debug('HANDLE', event);
  }
}
