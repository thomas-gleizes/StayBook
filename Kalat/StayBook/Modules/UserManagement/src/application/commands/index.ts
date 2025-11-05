import { CreateUserHandler } from './create-user/create-user.handler';
import { CommandHandlerType } from '@nestjs/cqrs';

export const usersCommandHanders: CommandHandlerType[] = [CreateUserHandler];
