import { UserCreatedEvent } from './users/user-created.event';
import { UserEditedEvent } from './users/user-edited.event';
import { Type } from '@nestjs/common';
import { BaseEvent } from '../../shared/interface/base-event.interface';

export const UserEvents: Type<BaseEvent>[] = [UserCreatedEvent, UserEditedEvent];

export const Events: Type<BaseEvent>[] = [...UserEvents];
