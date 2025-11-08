import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EditUserCommand } from './edit-user.command';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '../../../domain/repostiories/user-command.repostiory';
import { UserNotFoundException } from '../../../domain/exceptions/users/user-not-found.exception';

@CommandHandler(EditUserCommand)
export class EditUserHandler implements ICommandHandler<EditUserCommand> {
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepository: IUserCommandRepository,
  ) {}

  async execute(command: EditUserCommand) {
    const aggregate = await this.userCommandRepository.findById(command.userId);

    if (!aggregate) throw new UserNotFoundException();

    aggregate.edit(command.input);

    await this.userCommandRepository.persist(aggregate);

    return aggregate;
  }
}
