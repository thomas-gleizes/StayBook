import { ICommand } from '@nestjs/cqrs';
import { UserCreateInput } from '../../../domain/aggregates/user.aggregate';

export class CreateUserCommand implements ICommand {
  constructor(public readonly input: UserCreateInput) {}
}
