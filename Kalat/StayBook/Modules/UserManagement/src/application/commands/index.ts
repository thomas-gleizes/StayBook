import { CreateUserHandler } from './create-user/create-user.handler';
import { CommandHandlerType } from '@nestjs/cqrs';
import { EditUserHandler } from './edit-user/edit-user.handler';

export const usersCommandHanders: CommandHandlerType[] = [CreateUserHandler, EditUserHandler];
