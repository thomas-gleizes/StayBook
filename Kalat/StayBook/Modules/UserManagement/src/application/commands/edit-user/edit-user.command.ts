import { ICommand } from '@nestjs/cqrs';
import { UserEditInput } from '../../../domain/aggregates/user.aggregate';

export class EditUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly input: UserEditInput,
  ) {}
}
