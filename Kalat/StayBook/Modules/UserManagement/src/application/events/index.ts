import { EventHandlerType } from '@nestjs/cqrs';
import { UserCreatedHandler } from './user-created.handler';

export const eventHanders: EventHandlerType[] = [UserCreatedHandler];
