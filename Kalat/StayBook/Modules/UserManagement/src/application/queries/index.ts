import { QueryHandlerType } from '@nestjs/cqrs';
import { FindUserHandler } from './find-user/find-user.handler';

export const userQueryHandlers: QueryHandlerType[] = [FindUserHandler];
